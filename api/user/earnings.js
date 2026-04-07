import { getEffectiveUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'

const EARN_PER_AD_USD = 0.4
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const PACK_ADS_PER_DAY = {
  10: 1,
  20: 2,
  50: 5,
  100: 10,
  200: 20,
  500: 50,
  1000: 100,
}

function mapRow(e) {
  return {
    id: e.id,
    userId: e.user_id,
    source: e.source,
    amountUsd: Number(e.amount_usd),
    note: e.note || null,
    date: e.date,
  }
}

export default async function handler(req, res) {
  const userId = getEffectiveUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('earnings_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load earnings.' })
    return json(res, 200, { ok: true, earnings: (data || []).map(mapRow) })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const { source, amountUsd, note } = body
    let amount_usd = Number(amountUsd) || 0
    if (!source || String(source).trim() === '') {
      return json(res, 400, { ok: false, error: 'Source is required.' })
    }
    const sourceStr = String(source).trim()
    if (sourceStr === 'team-salary') {
      return json(res, 400, { ok: false, error: 'Use the Claim salary button on the Team page. Team salary can only be claimed once every 7 days.' })
    }

    // Server-side guard for watch-ads so users cannot bypass daily limits from client/network tools.
    if (sourceStr === 'watch-ads') {
      amount_usd = EARN_PER_AD_USD

      const cutoffIso = new Date(Date.now() - NINETY_DAYS_MS).toISOString()
      const [{ data: walletRow, error: walletErr }, { data: packsRows, error: packsErr }] = await Promise.all([
        supabase.from('user_wallet').select('active_pack_usd').eq('user_id', userId).maybeSingle(),
        supabase
          .from('user_active_packs')
          .select('pack_usd, created_at')
          .eq('user_id', userId)
          .gte('created_at', cutoffIso),
      ])
      if (walletErr || packsErr) return json(res, 500, { ok: false, error: 'Unable to verify watch access.' })

      let activePacks = Array.isArray(packsRows)
        ? packsRows.map((r) => Number(r.pack_usd)).filter((n) => Number.isFinite(n) && n > 0)
        : []
      if (activePacks.length === 0 && walletRow?.active_pack_usd != null) {
        const legacyPack = Number(walletRow.active_pack_usd)
        if (Number.isFinite(legacyPack) && legacyPack > 0) activePacks = [legacyPack]
      }
      const dailyLimit = activePacks.reduce((sum, usd) => sum + (PACK_ADS_PER_DAY[usd] || 0), 0)
      if (dailyLimit <= 0) {
        return json(res, 403, { ok: false, error: 'No active ads engine.' })
      }

      const watchCutoffIso = new Date(Date.now() - DAY_MS).toISOString()
      const { count: watchedLast24h, error: countErr } = await supabase
        .from('earnings_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('source', 'watch-ads')
        .gte('date', watchCutoffIso)
      if (countErr) return json(res, 500, { ok: false, error: 'Unable to verify daily watch limit.' })
      if ((watchedLast24h || 0) >= dailyLimit) {
        return json(res, 429, { ok: false, error: 'Daily ad limit reached.' })
      }
    }

    const { data: inserted, error } = await supabase
      .from('earnings_history')
      .insert({
        user_id: userId,
        source: sourceStr,
        amount_usd,
        note: note != null ? String(note) : null,
      })
      .select()
      .single()
    if (error) return json(res, 500, { ok: false, error: 'Unable to create earnings entry.' })

    let balanceUsd = null
    if (sourceStr === 'watch-ads' && amount_usd > 0) {
      const now = new Date().toISOString()
      const { data: wRow } = await supabase.from('user_wallet').select('balance_usd').eq('user_id', userId).maybeSingle()
      const current = wRow ? Number(wRow.balance_usd) : 0
      const next = Number((current + amount_usd).toFixed(2))
      const { error: walletErr2 } = await supabase
        .from('user_wallet')
        .upsert({ user_id: userId, balance_usd: next, updated_at: now }, { onConflict: 'user_id' })
      if (!walletErr2) balanceUsd = next
    }

    // Team commission: when this user earns from watch-ads, credit L1/L2/L3 referrers (10%, 2%, 1%)
    if (sourceStr === 'watch-ads' && amount_usd > 0) {
      const REFERRAL_RATES = { 1: 0.1, 2: 0.02, 3: 0.01 }
      const now = new Date().toISOString()
      try {
        const { data: earner } = await supabase.from('users').select('referred_by_user_id').eq('id', userId).maybeSingle()
        let l1Id = earner?.referred_by_user_id || null
        if (l1Id) {
          const { data: l1User } = await supabase.from('users').select('referred_by_user_id').eq('id', l1Id).maybeSingle()
          const l2Id = l1User?.referred_by_user_id || null
          let l3Id = null
          if (l2Id) {
            const { data: l2User } = await supabase.from('users').select('referred_by_user_id').eq('id', l2Id).maybeSingle()
            l3Id = l2User?.referred_by_user_id || null
          }
          const referrers = [
            { id: l1Id, level: 1 },
            ...(l2Id ? [{ id: l2Id, level: 2 }] : []),
            ...(l3Id ? [{ id: l3Id, level: 3 }] : []),
          ]
          for (const { id: referrerId, level } of referrers) {
            const rate = REFERRAL_RATES[level]
            const commission = Number((amount_usd * rate).toFixed(2))
            if (commission <= 0) continue
            await supabase.from('earnings_history').insert({
              user_id: referrerId,
              from_user_id: userId,
              source: `team-watch-level${level}`,
              amount_usd: commission,
              note: `Team commission ${level === 1 ? '10' : level === 2 ? '2' : '1'}% of watch-ads earning`,
            })
            const { data: wRow } = await supabase.from('user_wallet').select('balance_usd').eq('user_id', referrerId).maybeSingle()
            const cur = wRow ? Number(wRow.balance_usd) : 0
            const next = Number((cur + commission).toFixed(2))
            await supabase.from('user_wallet').upsert({ user_id: referrerId, balance_usd: next, updated_at: now }, { onConflict: 'user_id' })
          }
        }
      } catch (err) {
        console.error('Team watch-ads commission failed', err)
      }
    }

    return json(res, 200, { ok: true, earning: mapRow(inserted), ...(balanceUsd != null ? { balanceUsd } : {}) })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

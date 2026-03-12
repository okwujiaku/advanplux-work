import { getEffectiveUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'

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
    const amount_usd = Number(amountUsd) || 0
    if (!source || String(source).trim() === '') {
      return json(res, 400, { ok: false, error: 'Source is required.' })
    }
    const sourceStr = String(source).trim()
    if (sourceStr === 'team-salary') {
      return json(res, 400, { ok: false, error: 'Use the Claim salary button on the Team page. Team salary can only be claimed once every 7 days.' })
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

    return json(res, 200, { ok: true, earning: mapRow(inserted) })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

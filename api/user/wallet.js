import { getEffectiveUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'

export default async function handler(req, res) {
  const userId = getEffectiveUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  if (req.method === 'GET') {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
    const cutoffIso = new Date(Date.now() - THIRTY_DAYS_MS).toISOString()
    const [{ data: walletRow, error: walletErr }, { data: packsRows, error: packsErr }] = await Promise.all([
      supabase.from('user_wallet').select('balance_usd, active_pack_usd').eq('user_id', userId).maybeSingle(),
      supabase
        .from('user_active_packs')
        .select('pack_usd, created_at')
        .eq('user_id', userId)
        .gte('created_at', cutoffIso)
        .order('created_at', { ascending: true }),
    ])
    if (walletErr || packsErr) return json(res, 500, { ok: false, error: 'Unable to load wallet.' })
    const balance = walletRow ? Number(walletRow.balance_usd) : 0
    let activePacks = Array.isArray(packsRows) ? packsRows.map((r) => Number(r.pack_usd)).filter(Number.isFinite) : []
    if (activePacks.length === 0 && walletRow?.active_pack_usd != null) {
      const legacy = Number(walletRow.active_pack_usd)
      if (Number.isFinite(legacy)) activePacks = [legacy]
    }
    const activePackUsd = activePacks.length > 0 ? Math.max(...activePacks) : null
    return json(res, 200, { ok: true, balanceUsd: balance, activePackUsd, activePacks })
  }

  if (req.method === 'PATCH') {
    const { balanceUsd, addUsd, activatePackUsd } = req.body || {}

    if (activatePackUsd != null) {
      const packUsd = Number(activatePackUsd)
      if (!Number.isFinite(packUsd) || packUsd <= 0) return json(res, 400, { ok: false, error: 'Invalid pack amount.' })
      const { data: row, error: fetchErr } = await supabase
        .from('user_wallet')
        .select('balance_usd')
        .eq('user_id', userId)
        .maybeSingle()
      if (fetchErr) return json(res, 500, { ok: false, error: 'Unable to load wallet.' })
      const balance = row ? Number(row.balance_usd) : 0
      if (balance < packUsd) return json(res, 400, { ok: false, error: 'Insufficient balance to activate this pack.' })
      const nextBalance = Number((balance - packUsd).toFixed(2))
      const now = new Date().toISOString()
      const { error: insertPackErr } = await supabase.from('user_active_packs').insert({
        user_id: userId,
        pack_usd: packUsd,
      })
      if (insertPackErr) return json(res, 500, { ok: false, error: 'Unable to activate pack.' })
      const { error: upsertErr } = await supabase.from('user_wallet').upsert(
        { user_id: userId, balance_usd: nextBalance, updated_at: now },
        { onConflict: 'user_id' },
      )
      if (upsertErr) return json(res, 500, { ok: false, error: 'Unable to update balance.' })

      // Affiliate credits: 10% L1, 2% L2, 1% L3 of pack amount (e.g. $20 → $2, $0.40, $0.20)
      const REFERRAL_RATES = { 1: 0.1, 2: 0.02, 3: 0.01 }
      try {
        const { data: activator } = await supabase.from('users').select('referred_by_user_id').eq('id', userId).maybeSingle()
        let l1Id = activator?.referred_by_user_id || null
        if (!l1Id) {
          const { data: packsRows } = await supabase.from('user_active_packs').select('pack_usd').eq('user_id', userId).order('created_at', { ascending: true })
          const activePacks = Array.isArray(packsRows) ? packsRows.map((r) => Number(r.pack_usd)).filter(Number.isFinite) : []
          const activePackUsd = activePacks.length > 0 ? Math.max(...activePacks) : null
          return json(res, 200, { ok: true, balanceUsd: nextBalance, activePackUsd, activePacks })
        }
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
          const amountUsd = Number((packUsd * rate).toFixed(2))
          if (amountUsd <= 0) continue
          await supabase.from('earnings_history').insert({
            user_id: referrerId,
            source: `referral-level${level}`,
            amount_usd: amountUsd,
            note: `Affiliate ${level === 1 ? '10' : level === 2 ? '2' : '1'}% of $${packUsd} pack`,
          })
          const { data: wRow } = await supabase.from('user_wallet').select('balance_usd').eq('user_id', referrerId).maybeSingle()
          const cur = wRow ? Number(wRow.balance_usd) : 0
          const next = Number((cur + amountUsd).toFixed(2))
          await supabase.from('user_wallet').upsert({ user_id: referrerId, balance_usd: next, updated_at: now }, { onConflict: 'user_id' })
        }
      } catch {
        // Don't fail pack activation if referral credit fails
      }

      const { data: packsRows } = await supabase
        .from('user_active_packs')
        .select('pack_usd')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      const activePacks = Array.isArray(packsRows) ? packsRows.map((r) => Number(r.pack_usd)).filter(Number.isFinite) : []
      const activePackUsd = activePacks.length > 0 ? Math.max(...activePacks) : null
      return json(res, 200, { ok: true, balanceUsd: nextBalance, activePackUsd, activePacks })
    }

    if (addUsd != null) {
      const amount = Number(addUsd)
      if (Number.isNaN(amount)) return json(res, 400, { ok: false, error: 'Invalid addUsd.' })
      const { data: row, error: fetchErr } = await supabase
        .from('user_wallet')
        .select('balance_usd')
        .eq('user_id', userId)
        .maybeSingle()
      if (fetchErr) return json(res, 500, { ok: false, error: 'Unable to update wallet.' })
      const current = row ? Number(row.balance_usd) : 0
      const next = Math.max(0, Number((current + amount).toFixed(2)))
      const now = new Date().toISOString()
      const { error: upsertErr } = await supabase.from('user_wallet').upsert(
        { user_id: userId, balance_usd: next, updated_at: now },
        { onConflict: 'user_id' },
      )
      if (upsertErr) return json(res, 500, { ok: false, error: 'Unable to update wallet.' })
      return json(res, 200, { ok: true, balanceUsd: next })
    }
    if (balanceUsd != null) {
      const next = Math.max(0, Number(Number(balanceUsd).toFixed(2)))
      const now = new Date().toISOString()
      const { error: upsertErr } = await supabase.from('user_wallet').upsert(
        { user_id: userId, balance_usd: next, updated_at: now },
        { onConflict: 'user_id' },
      )
      if (upsertErr) return json(res, 500, { ok: false, error: 'Unable to update wallet.' })
      return json(res, 200, { ok: true, balanceUsd: next })
    }
    return json(res, 400, { ok: false, error: 'Provide balanceUsd, addUsd, or activatePackUsd.' })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

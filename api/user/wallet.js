import { getCurrentUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'

export default async function handler(req, res) {
  const userId = getCurrentUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  if (req.method === 'GET') {
    const [{ data: walletRow, error: walletErr }, { data: packsRows, error: packsErr }] = await Promise.all([
      supabase.from('user_wallet').select('balance_usd, active_pack_usd').eq('user_id', userId).maybeSingle(),
      supabase.from('user_active_packs').select('pack_usd').eq('user_id', userId).order('created_at', { ascending: true }),
    ])
    if (walletErr) return json(res, 500, { ok: false, error: 'Unable to load wallet.' })
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

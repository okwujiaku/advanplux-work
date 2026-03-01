import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

/** PATCH: add or set user balance (admin). Body: { userId, addUsd } or { userId, balanceUsd }. Logs to admin_investment_history. */
export default async function handler(req, res) {
  if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  if (req.method !== 'PATCH') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const { userId, addUsd, balanceUsd, type } = req.body || {}
  if (!userId) return json(res, 400, { ok: false, error: 'userId required.' })

  const { data: row } = await supabase.from('user_wallet').select('balance_usd').eq('user_id', userId).maybeSingle()
  const current = row ? Number(row.balance_usd) : 0

  let nextBalance
  if (addUsd != null) {
    const add = Number(addUsd)
    if (!Number.isFinite(add)) return json(res, 400, { ok: false, error: 'Invalid addUsd.' })
    nextBalance = Math.max(0, Number((current + add).toFixed(2)))
  } else if (balanceUsd != null) {
    nextBalance = Math.max(0, Number(Number(balanceUsd).toFixed(2)))
  } else {
    return json(res, 400, { ok: false, error: 'addUsd or balanceUsd required.' })
  }

  const { error: upsertErr } = await supabase.from('user_wallet').upsert(
    { user_id: userId, balance_usd: nextBalance, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  )
  if (upsertErr) return json(res, 500, { ok: false, error: 'Unable to update wallet.' })

  const logType = type || (addUsd != null && Number(addUsd) >= 0 ? 'topup' : addUsd != null ? 'deduct' : 'set')
  await supabase.from('admin_investment_history').insert({
    user_id: userId,
    type: logType,
    amount_usd: nextBalance - current,
  })

  return json(res, 200, { ok: true, balanceUsd: nextBalance })
}

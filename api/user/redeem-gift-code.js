import { getCurrentUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const userId = getCurrentUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  const code = String(req.body?.code || '').trim()
  if (!code) return json(res, 400, { ok: false, error: 'Gift code is required.' })

  const { data: row, error: fetchErr } = await supabase
    .from('gift_codes')
    .select('id, value_usd, redeemed_at, redeemed_by_user_id')
    .eq('code', code)
    .maybeSingle()

  if (fetchErr || !row) return json(res, 400, { ok: false, error: 'Invalid or expired gift code.' })
  if (row.redeemed_at || row.redeemed_by_user_id) return json(res, 400, { ok: false, error: 'This gift code has already been redeemed.' })

  const valueUsd = Number(row.value_usd) || 0
  if (valueUsd <= 0) return json(res, 400, { ok: false, error: 'Invalid gift code value.' })

  const { data: walletRow } = await supabase.from('user_wallet').select('balance_usd').eq('user_id', userId).maybeSingle()
  const currentBalance = walletRow ? Number(walletRow.balance_usd) : 0
  const newBalance = Number((currentBalance + valueUsd).toFixed(2))
  const now = new Date().toISOString()

  const { error: walletErr } = await supabase.from('user_wallet').upsert(
    { user_id: userId, balance_usd: newBalance, updated_at: now },
    { onConflict: 'user_id' },
  )
  if (walletErr) return json(res, 500, { ok: false, error: 'Could not credit your balance.' })

  await supabase
    .from('gift_codes')
    .update({ redeemed_at: now, redeemed_by_user_id: userId })
    .eq('id', row.id)

  return json(res, 200, { ok: true, creditedUsd: valueUsd, newBalanceUsd: newBalance })
}

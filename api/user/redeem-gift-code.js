import { getEffectiveUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const userId = getEffectiveUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  const code = String(req.body?.code || '').trim()
  if (!code) return json(res, 400, { ok: false, error: 'Gift code is required.' })

  const now = new Date().toISOString()

  // Atomically claim the code only if not already redeemed (prevents double redemption including race conditions)
  const { data: claimed, error: claimErr } = await supabase
    .from('gift_codes')
    .update({ redeemed_at: now, redeemed_by_user_id: userId })
    .eq('code', code)
    .is('redeemed_at', null)
    .select('id, value_usd')
    .maybeSingle()

  if (claimErr) return json(res, 500, { ok: false, error: 'Unable to redeem gift code.' })
  if (!claimed) {
    const { data: existing } = await supabase.from('gift_codes').select('id, redeemed_at').eq('code', code).maybeSingle()
    if (existing) return json(res, 400, { ok: false, error: 'This gift code has already been redeemed.' })
    return json(res, 400, { ok: false, error: 'Invalid or expired gift code.' })
  }

  const valueUsd = Number(claimed.value_usd) || 0
  if (valueUsd <= 0) return json(res, 400, { ok: false, error: 'Invalid gift code value.' })

  const { data: walletRow } = await supabase.from('user_wallet').select('balance_usd').eq('user_id', userId).maybeSingle()
  const currentBalance = walletRow ? Number(walletRow.balance_usd) : 0
  const newBalance = Number((currentBalance + valueUsd).toFixed(2))

  const { error: walletErr } = await supabase.from('user_wallet').upsert(
    { user_id: userId, balance_usd: newBalance, updated_at: now },
    { onConflict: 'user_id' },
  )
  if (walletErr) return json(res, 500, { ok: false, error: 'Could not credit your balance.' })

  return json(res, 200, { ok: true, creditedUsd: valueUsd, newBalanceUsd: newBalance })
}

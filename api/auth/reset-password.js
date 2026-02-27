import bcrypt from 'bcryptjs'
import {
  getSupabaseAdmin,
  json,
  normalizeEmail,
  normalizePhone,
} from '../_lib/auth-utils.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Password reset is not available. Contact support.' })
  }

  const { emailOrPhone, pin, newPassword, confirmPassword } = req.body || {}
  const identifier = String(emailOrPhone || '').trim()
  const pinStr = String(pin ?? '').trim()
  const nextPassword = String(newPassword || '')
  const confirmNext = String(confirmPassword || '')

  if (!identifier || !pinStr || !nextPassword || !confirmNext) {
    return json(res, 400, { ok: false, error: 'Email/phone, security PIN, and both password fields are required.' })
  }
  if (!/^\d{4}$/.test(pinStr)) {
    return json(res, 400, { ok: false, error: 'Security PIN must be 4 digits.' })
  }
  if (nextPassword !== confirmNext) {
    return json(res, 400, { ok: false, error: 'New password and confirm password must match.' })
  }

  let query = supabase
    .from('users')
    .select('id, email, phone, pin_hash')
    .limit(1)

  if (identifier.includes('@')) {
    query = query.eq('email', normalizeEmail(identifier))
  } else {
    query = query.eq('phone', normalizePhone(identifier))
  }

  const { data: user, error: fetchError } = await query.maybeSingle()
  if (fetchError || !user) {
    return json(res, 404, { ok: false, error: 'Account not found.' })
  }
  if (!user.pin_hash) {
    return json(res, 400, {
      ok: false,
      error: 'This account has no security PIN set. Contact support to reset your password.',
    })
  }

  const pinValid = await bcrypt.compare(pinStr, user.pin_hash)
  if (!pinValid) {
    return json(res, 401, { ok: false, error: 'Incorrect security PIN.' })
  }

  const passwordHash = await bcrypt.hash(nextPassword, 12)
  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', user.id)

  if (updateError) {
    return json(res, 500, { ok: false, error: 'Unable to update password. Try again or contact support.' })
  }
  return json(res, 200, { ok: true })
}

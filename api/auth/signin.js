import bcrypt from 'bcryptjs'
import {
  getSupabaseAdmin,
  json,
  normalizeEmail,
  normalizePhone,
  signSessionToken,
  stripSensitiveUser,
} from '../_lib/auth-utils.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed.' })
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  const { emailOrPhone, password } = req.body || {}
  const identifier = String(emailOrPhone || '').trim()
  const cleanPassword = String(password || '')
  if (!identifier || !cleanPassword) {
    return json(res, 400, { ok: false, error: 'Email/phone and password are required.' })
  }

  let query = supabase
    .from('users')
    .select('id,email,phone,password_hash,invitation_code,referred_by_user_id,created_at,banned')
    .limit(1)

  if (identifier.includes('@')) {
    query = query.eq('email', normalizeEmail(identifier))
  } else {
    query = query.eq('phone', normalizePhone(identifier))
  }

  const { data, error } = await query.maybeSingle()
  if (error || !data) {
    return json(res, 401, { ok: false, error: 'Invalid login details.' })
  }
  if (data.banned) {
    return json(res, 403, { ok: false, error: 'Account is suspended. Contact support.' })
  }

  const matches = await bcrypt.compare(cleanPassword, data.password_hash || '')
  if (!matches) {
    return json(res, 401, { ok: false, error: 'Invalid login details.' })
  }

  const token = signSessionToken(data)
  return json(res, 200, {
    ok: true,
    token,
    user: stripSensitiveUser(data),
  })
}


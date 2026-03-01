import bcrypt from 'bcryptjs'
import { getSupabaseAdmin, json } from '../_lib/auth-utils.js'

function normalizeEmail(v) {
  return String(v || '').trim().toLowerCase()
}

/** POST: admin login (email + password). No X-Admin-Key. Returns ok if credentials match admin_users. */
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  const { email, password } = req.body || {}
  const emailNorm = normalizeEmail(email)
  const pass = String(password || '').trim()
  if (!emailNorm || !pass) return json(res, 400, { ok: false, error: 'Email and password required.' })

  const { data, error } = await supabase.from('admin_users').select('id, email, password_hash').eq('email', emailNorm).maybeSingle()
  if (error || !data) return json(res, 401, { ok: false, error: 'Invalid email or password.' })

  const match = await bcrypt.compare(pass, data.password_hash || '')
  if (!match) return json(res, 401, { ok: false, error: 'Invalid email or password.' })

  return json(res, 200, { ok: true })
}

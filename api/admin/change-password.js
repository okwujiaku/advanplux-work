import bcrypt from 'bcryptjs'
import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

function normalizeEmail(v) {
  return String(v || '').trim().toLowerCase()
}

/** PATCH: change admin password. Body: { email, oldPassword, newPassword }. */
export default async function handler(req, res) {
  if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  if (req.method !== 'PATCH') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const { email, oldPassword, newPassword } = req.body || {}
  const emailNorm = normalizeEmail(email)
  const newPass = String(newPassword || '').trim()
  if (!emailNorm || !oldPassword || newPass.length < 6) return json(res, 400, { ok: false, error: 'Email, old password, and new password (min 6) required.' })

  const { data, error } = await supabase.from('admin_users').select('id, password_hash').eq('email', emailNorm).maybeSingle()
  if (error || !data) return json(res, 401, { ok: false, error: 'Invalid email.' })

  const match = await bcrypt.compare(String(oldPassword), data.password_hash || '')
  if (!match) return json(res, 401, { ok: false, error: 'Old password incorrect.' })

  const passwordHash = await bcrypt.hash(newPass, 10)
  const { error: updateErr } = await supabase.from('admin_users').update({ password_hash: passwordHash }).eq('id', data.id)
  if (updateErr) return json(res, 500, { ok: false, error: 'Unable to update password.' })

  return json(res, 200, { ok: true })
}

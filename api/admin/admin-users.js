import bcrypt from 'bcryptjs'
import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

function normalizeEmail(v) {
  return String(v || '').trim().toLowerCase()
}

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  if (req.method === 'GET') {
    if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })
    const { data, error } = await supabase.from('admin_users').select('id, email, created_at').order('created_at', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load.' })
    const list = (data || []).map((r) => ({ email: r.email }))
    return json(res, 200, { ok: true, adminAccounts: list })
  }

  if (req.method === 'POST') {
    if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })
    const { email, password } = req.body || {}
    const emailNorm = normalizeEmail(email)
    const pass = String(password || '').trim()
    if (!emailNorm || pass.length < 6) return json(res, 400, { ok: false, error: 'Email and password (min 6) required.' })
    const passwordHash = await bcrypt.hash(pass, 10)
    const { error } = await supabase.from('admin_users').insert({ email: emailNorm, password_hash: passwordHash })
    if (error) return json(res, 500, { ok: false, error: 'Unable to register (email may exist).' })
    return json(res, 200, { ok: true })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

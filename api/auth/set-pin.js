import bcrypt from 'bcryptjs'
import { getCurrentUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed.' })
  const userId = getCurrentUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  const pin = String(req.body?.pin ?? '').trim()
  if (!/^\d{4}$/.test(pin)) {
    return json(res, 400, { ok: false, error: 'PIN must be exactly 4 digits.' })
  }

  const pinHash = await bcrypt.hash(pin, 12)
  const { error } = await supabase.from('users').update({ pin_hash: pinHash }).eq('id', userId)

  if (error) return json(res, 500, { ok: false, error: 'Unable to save PIN.' })
  return json(res, 200, { ok: true })
}

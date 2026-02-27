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
    return json(res, 400, { ok: false, error: 'PIN must be exactly 4 digits.', verified: false })
  }

  const { data, error } = await supabase.from('users').select('pin_hash').eq('id', userId).maybeSingle()
  if (error || !data) return json(res, 500, { ok: false, error: 'Unable to verify PIN.', verified: false })
  if (!data.pin_hash) return json(res, 400, { ok: false, error: 'No PIN set. Create a PIN first.', verified: false })

  const verified = await bcrypt.compare(pin, data.pin_hash)
  return json(res, 200, { ok: true, verified })
}

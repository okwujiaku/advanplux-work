import {
  getCurrentUserIdFromRequest,
  getSupabaseAdmin,
  json,
  stripSensitiveUser,
} from '../_lib/auth-utils.js'

/**
 * GET: return current user from JWT. No localStorage needed for user data.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const userId = getCurrentUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Backend not configured.' })
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, email, phone, invitation_code, referred_by_user_id, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return json(res, 401, { ok: false, error: 'User not found.' })

  const user = stripSensitiveUser(data)
  return json(res, 200, { ok: true, user })
}

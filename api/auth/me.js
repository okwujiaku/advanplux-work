import {
  getEffectiveUserIdFromRequest,
  getSupabaseAdmin,
  json,
  stripSensitiveUser,
} from '../_lib/auth-utils.js'

/**
 * GET: return current user from JWT. No localStorage needed for user data.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const userId = getEffectiveUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Backend not configured.' })
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, email, phone, invitation_code, referred_by_user_id, created_at, banned')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return json(res, 401, { ok: false, error: 'User not found.' })
  if (data.banned) return json(res, 403, { ok: false, error: 'Account is suspended.' })

  let referrerInvitationCode = null
  if (data.referred_by_user_id) {
    const { data: referrer } = await supabase
      .from('users')
      .select('invitation_code')
      .eq('id', data.referred_by_user_id)
      .maybeSingle()
    referrerInvitationCode = referrer?.invitation_code || null
  }

  const user = { ...stripSensitiveUser(data), referrerInvitationCode }
  return json(res, 200, { ok: true, user })
}

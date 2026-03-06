import { getCurrentUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'

function mapUser(row) {
  return {
    id: row.id,
    email: row.email || '',
    invitationCode: row.invitation_code || '',
    joinedAt: row.created_at || null,
  }
}

/**
 * GET: return lists of referred members by level (L1, L2, L3) for the current user.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const userId = getCurrentUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  const { data: level1Rows, error: e1 } = await supabase
    .from('users')
    .select('id, email, invitation_code, created_at')
    .eq('referred_by_user_id', userId)
    .order('created_at', { ascending: false })
  if (e1) return json(res, 500, { ok: false, error: 'Unable to load referral list.' })

  const level1 = (level1Rows || []).map(mapUser)
  const level1Ids = level1.map((u) => u.id)

  if (level1Ids.length === 0) {
    return json(res, 200, { ok: true, level1: [], level2: [], level3: [] })
  }

  const { data: level2Rows, error: e2 } = await supabase
    .from('users')
    .select('id, email, invitation_code, created_at')
    .in('referred_by_user_id', level1Ids)
    .order('created_at', { ascending: false })
  if (e2) return json(res, 500, { ok: false, error: 'Unable to load referral list.' })

  const level2 = (level2Rows || []).map(mapUser)
  const level2Ids = level2.map((u) => u.id)

  let level3 = []
  if (level2Ids.length > 0) {
    const { data: level3Rows, error: e3 } = await supabase
      .from('users')
      .select('id, email, invitation_code, created_at')
      .in('referred_by_user_id', level2Ids)
      .order('created_at', { ascending: false })
    if (!e3 && level3Rows) level3 = level3Rows.map(mapUser)
  }

  return json(res, 200, { ok: true, level1, level2, level3 })
}

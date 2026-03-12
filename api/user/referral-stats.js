import { getEffectiveUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'

/**
 * GET: return referral counts (level1, level2, level3) for the current user.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const userId = getEffectiveUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  const { data: level1Rows, error: e1 } = await supabase
    .from('users')
    .select('id')
    .eq('referred_by_user_id', userId)
  if (e1) return json(res, 500, { ok: false, error: 'Unable to load referral stats.' })

  const level1Ids = new Set((level1Rows || []).map((r) => r.id))
  if (level1Ids.size === 0) {
    return json(res, 200, { ok: true, level1: 0, level2: 0, level3: 0, directActiveDownlines: 0 })
  }

  const { data: level2Rows, error: e2 } = await supabase
    .from('users')
    .select('id')
    .in('referred_by_user_id', Array.from(level1Ids))
  if (e2) return json(res, 500, { ok: false, error: 'Unable to load referral stats.' })

  const level2Ids = new Set((level2Rows || []).map((r) => r.id))
  let level3Count = 0
  if (level2Ids.size > 0) {
    const { data: level3Rows, error: e3 } = await supabase
      .from('users')
      .select('id')
      .in('referred_by_user_id', Array.from(level2Ids))
    if (!e3 && level3Rows) level3Count = level3Rows.length
  }

  // Direct active downlines = L1 users who have invested (have at least one active pack)
  let directActiveDownlines = 0
  if (level1Ids.size > 0) {
    const { data: packsRows } = await supabase
      .from('user_active_packs')
      .select('user_id')
      .in('user_id', Array.from(level1Ids))
    const investedL1Ids = new Set((packsRows || []).map((r) => r.user_id))
    directActiveDownlines = investedL1Ids.size
  }

  return json(res, 200, {
    ok: true,
    level1: level1Ids.size,
    level2: level2Ids.size,
    level3: level3Count,
    directActiveDownlines,
  })
}

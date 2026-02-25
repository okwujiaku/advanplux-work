import { getSupabaseAdmin, json } from '../_lib/auth-utils.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed.' })
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  const { data, error } = await supabase
    .from('users')
    .select('id,email,phone,invitation_code,referred_by_user_id,created_at')
    .order('created_at', { ascending: false })

  if (error) return json(res, 500, { ok: false, error: 'Failed to fetch users.' })

  return json(res, 200, {
    ok: true,
    users: (data || []).map((user) => ({
      id: user.id,
      email: user.email || '',
      phone: user.phone || '',
      invitationCode: user.invitation_code || '',
      referredByUserId: user.referred_by_user_id || null,
      createdAt: user.created_at || null,
    })),
  })
}


import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  if (req.method === 'GET') {
    const { data: usersData, error } = await supabase
      .from('users')
      .select('id,email,phone,invitation_code,referred_by_user_id,created_at,banned')
      .order('created_at', { ascending: false })

    if (error) return json(res, 500, { ok: false, error: 'Failed to fetch users.' })

    const userIds = (usersData || []).map((u) => u.id)
    const balanceByUser = new Map()
    if (userIds.length > 0) {
      const { data: wallets } = await supabase
        .from('user_wallet')
        .select('user_id, balance_usd')
        .in('user_id', userIds)
      ;(wallets || []).forEach((w) => balanceByUser.set(w.user_id, Number(w.balance_usd) || 0))
    }

    return json(res, 200, {
      ok: true,
      users: (usersData || []).map((user) => ({
        id: user.id,
        email: user.email || '',
        phone: user.phone || '',
        invitationCode: user.invitation_code || '',
        referredByUserId: user.referred_by_user_id || null,
        createdAt: user.created_at || null,
        banned: !!user.banned,
        balanceUsd: balanceByUser.get(user.id) ?? 0,
      })),
    })
  }

  if (req.method === 'PATCH' && isAdminRequest(req)) {
    const { id, email, invitationCode, banned } = req.body || {}
    if (!id) return json(res, 400, { ok: false, error: 'User id required.' })
    const updates = {}
    if (typeof email === 'string') updates.email = email.trim().toLowerCase() || null
    if (typeof invitationCode === 'string') updates.invitation_code = invitationCode.trim() || null
    if (typeof banned === 'boolean') updates.banned = banned
    if (Object.keys(updates).length === 0) return json(res, 400, { ok: false, error: 'Nothing to update.' })
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single()
    if (error) return json(res, 500, { ok: false, error: 'Failed to update user.' })
    return json(res, 200, {
      ok: true,
      user: {
        id: data.id,
        email: data.email || '',
        invitationCode: data.invitation_code || '',
        banned: !!data.banned,
      },
    })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}


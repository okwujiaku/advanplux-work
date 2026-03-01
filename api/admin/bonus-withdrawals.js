import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

function mapRow(r) {
  return {
    id: r.id,
    userId: r.user_id,
    amount: Number(r.amount_usd),
    accountNumber: r.account_number,
    status: r.status || 'pending',
    date: r.created_at,
    createdAt: r.created_at,
    approvedAt: r.approved_at,
  }
}

export default async function handler(req, res) {
  if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('bonus_withdrawals').select('*').order('created_at', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load.' })
    return json(res, 200, { ok: true, bonusWithdrawals: (data || []).map(mapRow) })
  }

  if (req.method === 'POST') {
    const { memberId, amount, accountNumber } = req.body || {}
    const userId = memberId || req.body.userId
    const amountUsd = Number(amount)
    if (!userId || !Number.isFinite(amountUsd) || amountUsd <= 0) return json(res, 400, { ok: false, error: 'Member and amount required.' })
    const { data: inserted, error } = await supabase
      .from('bonus_withdrawals')
      .insert({ user_id: userId, amount_usd: amountUsd, account_number: accountNumber || null, status: 'pending' })
      .select()
      .single()
    if (error) return json(res, 500, { ok: false, error: 'Unable to create.' })
    return json(res, 200, { ok: true, bonusWithdrawal: mapRow(inserted) })
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body || {}
    if (!id || status !== 'approved') return json(res, 400, { ok: false, error: 'id and status: approved required.' })
    const { data: updated, error } = await supabase
      .from('bonus_withdrawals')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) return json(res, 500, { ok: false, error: 'Unable to approve.' })
    return json(res, 200, { ok: true, bonusWithdrawal: mapRow(updated) })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

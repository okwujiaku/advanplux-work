import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

function mapRow(d) {
  return {
    id: d.id,
    userId: d.user_id,
    amount: d.amount,
    amountUsd: Number(d.amount_usd),
    currency: d.currency,
    country: d.country,
    paymentType: d.payment_type,
    accountName: d.account_name || '',
    accountNumber: d.account_number || '',
    bankName: d.bank_name || '',
    accountUsed: d.account_used || '',
    pack: d.pack,
    date: d.date,
    status: d.status || 'pending',
    approvedAt: d.approved_at || null,
    rejectedAt: d.rejected_at || null,
    reversedAt: d.reversed_at || null,
  }
}

export default async function handler(req, res) {
  if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load deposits.' })
    return json(res, 200, { ok: true, deposits: (data || []).map(mapRow) })
  }

  const id = req.query?.id || req.body?.id
  if (req.method === 'PATCH' && id) {
    const { status } = req.body || {}
    const s = String(status || '').toLowerCase()
    if (!['approved', 'rejected', 'reversed'].includes(s)) {
      return json(res, 400, { ok: false, error: 'Invalid status.' })
    }
    const { data: row, error: fetchErr } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', id)
      .single()
    if (fetchErr || !row) return json(res, 404, { ok: false, error: 'Deposit not found.' })
    if (row.status !== 'pending' && s !== 'reversed') {
      return json(res, 400, { ok: false, error: 'Deposit is not pending.' })
    }
    const now = new Date().toISOString()
    const updates = {}
    if (s === 'approved') {
      updates.status = 'approved'
      updates.approved_at = now
    } else if (s === 'rejected') {
      updates.status = 'rejected'
      updates.rejected_at = now
    } else {
      updates.status = 'reversed'
      updates.reversed_at = now
    }
    const { data: updated, error: updateErr } = await supabase
      .from('deposits')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (updateErr) return json(res, 500, { ok: false, error: 'Unable to update deposit.' })
    return json(res, 200, { ok: true, deposit: mapRow(updated) })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

function mapRow(w) {
  return {
    id: w.id,
    userId: w.user_id,
    amountUsd: Number(w.amount_usd),
    feeUsd: Number(w.fee_usd || 0),
    netAmountUsd: Number(w.net_amount_usd || 0),
    currency: w.currency,
    accountNumber: w.account_number || '',
    accountName: w.account_name || '',
    bankName: w.bank_name || '',
    date: w.date,
    status: w.status || 'pending',
    approvedAt: w.approved_at || null,
    rejectedAt: w.rejected_at || null,
    reversedAt: w.reversed_at || null,
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
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load withdrawals.' })
    return json(res, 200, { ok: true, withdrawals: (data || []).map(mapRow) })
  }

  const id = req.query?.id || req.body?.id
  if (req.method === 'PATCH' && id) {
    const { status } = req.body || {}
    const s = String(status || '').toLowerCase()
    if (!['approved', 'rejected', 'reversed'].includes(s)) {
      return json(res, 400, { ok: false, error: 'Invalid status.' })
    }
    const { data: row, error: fetchErr } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', id)
      .single()
    if (fetchErr || !row) return json(res, 404, { ok: false, error: 'Withdrawal not found.' })

    const amountUsd = Number(row.amount_usd) || 0
    const userId = row.user_id

    if (s === 'approved') {
      if (row.status !== 'pending') return json(res, 400, { ok: false, error: 'Withdrawal is not pending.' })
      const { data: wallet } = await supabase.from('user_wallet').select('balance_usd').eq('user_id', userId).maybeSingle()
      const balance = wallet ? Number(wallet.balance_usd) : 0
      if (balance < amountUsd) {
        return json(res, 400, { ok: false, error: 'User wallet balance is lower than withdrawal amount.' })
      }
      const now = new Date().toISOString()
      await supabase.from('user_wallet').upsert(
        { user_id: userId, balance_usd: Number((balance - amountUsd).toFixed(2)), updated_at: now },
        { onConflict: 'user_id' },
      )
      const { data: updated, error: updateErr } = await supabase
        .from('withdrawals')
        .update({ status: 'approved', approved_at: now })
        .eq('id', id)
        .select()
        .single()
      if (updateErr) return json(res, 500, { ok: false, error: 'Unable to update withdrawal.' })
      return json(res, 200, { ok: true, withdrawal: mapRow(updated) })
    }

    if (s === 'rejected') {
      if (row.status !== 'pending') return json(res, 400, { ok: false, error: 'Withdrawal is not pending.' })
      const now = new Date().toISOString()
      const { data: updated, error: updateErr } = await supabase
        .from('withdrawals')
        .update({ status: 'rejected', rejected_at: now })
        .eq('id', id)
        .select()
        .single()
      if (updateErr) return json(res, 500, { ok: false, error: 'Unable to update withdrawal.' })
      return json(res, 200, { ok: true, withdrawal: mapRow(updated) })
    }

    if (s === 'reversed') {
      if (row.status !== 'approved') return json(res, 400, { ok: false, error: 'Withdrawal is not approved.' })
      const now = new Date().toISOString()
      const { data: wallet } = await supabase.from('user_wallet').select('balance_usd').eq('user_id', userId).maybeSingle()
      const balance = wallet ? Number(wallet.balance_usd) : 0
      await supabase.from('user_wallet').upsert(
        { user_id: userId, balance_usd: Number((balance + amountUsd).toFixed(2)), updated_at: now },
        { onConflict: 'user_id' },
      )
      const { data: updated, error: updateErr } = await supabase
        .from('withdrawals')
        .update({ status: 'reversed', reversed_at: now })
        .eq('id', id)
        .select()
        .single()
      if (updateErr) return json(res, 500, { ok: false, error: 'Unable to update withdrawal.' })
      return json(res, 200, { ok: true, withdrawal: mapRow(updated) })
    }
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

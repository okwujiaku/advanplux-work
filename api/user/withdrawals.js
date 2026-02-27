import { getCurrentUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'

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
  const userId = getCurrentUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load withdrawals.' })
    return json(res, 200, { ok: true, withdrawals: (data || []).map(mapRow) })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const { amountUsd, feeUsd, netAmountUsd, currency, accountNumber, accountName, bankName } = body
    const amount_usd = Number(amountUsd) || 0
    const fee_usd = Number(feeUsd) || 0
    const net_amount_usd = Number(netAmountUsd) || amount_usd
    const { data: inserted, error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: userId,
        amount_usd,
        fee_usd,
        net_amount_usd,
        currency: currency || null,
        account_number: accountNumber || null,
        account_name: accountName || null,
        bank_name: bankName || null,
        status: 'pending',
      })
      .select()
      .single()
    if (error) return json(res, 500, { ok: false, error: 'Unable to create withdrawal.' })
    return json(res, 200, { ok: true, withdrawal: mapRow(inserted) })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

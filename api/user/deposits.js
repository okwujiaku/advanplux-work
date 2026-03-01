import { getCurrentUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'

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
  const userId = getCurrentUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load deposits.' })
    return json(res, 200, { ok: true, deposits: (data || []).map(mapRow) })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const { amount, amountUsd, currency, country, paymentType, accountName, accountNumber, bankName, accountUsed, pack } = body
    let amount_usd = Number(amountUsd) || 0
    if (amount_usd <= 0 && amount != null && currency) {
      const local = Number(String(amount).replace(/\s/g, '')) || 0
      const cur = String(currency).toUpperCase()
      if (cur === 'NGN' && local > 0) amount_usd = Math.round((local / 1450) * 100) / 100
      else if (cur === 'CFA' && local > 0) amount_usd = Math.round((local / 600) * 100) / 100
    }
    const { data: inserted, error } = await supabase
      .from('deposits')
      .insert({
        user_id: userId,
        amount: amount != null ? String(amount) : null,
        amount_usd,
        currency: currency || null,
        country: country || null,
        payment_type: paymentType || null,
        account_name: accountName || null,
        account_number: accountNumber || null,
        bank_name: bankName || null,
        account_used: accountUsed || null,
        pack: pack != null ? pack : null,
        status: 'pending',
      })
      .select()
      .single()
    if (error) return json(res, 500, { ok: false, error: 'Unable to create deposit.' })
    return json(res, 200, { ok: true, deposit: mapRow(inserted) })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

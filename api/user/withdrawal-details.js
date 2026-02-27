import { getCurrentUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'

export default async function handler(req, res) {
  const userId = getCurrentUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('user_withdrawal_details')
      .select('currency, account_name, account_number, bank_name, created_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) return json(res, 500, { ok: false, error: 'Unable to load withdrawal details.' })
    if (!data) return json(res, 200, { ok: true, detail: null })
    return json(res, 200, {
      ok: true,
      detail: {
        currency: data.currency || 'NGN',
        accountName: data.account_name || '',
        accountNumber: data.account_number || '',
        bankName: data.bank_name || '',
        createdAt: data.created_at || null,
      },
    })
  }

  if (req.method === 'POST') {
    const { currency, accountName, accountNumber, bankName } = req.body || {}
    const cur = String(currency || 'NGN').trim() || 'NGN'
    const name = String(accountName || '').trim()
    const number = String(accountNumber || '').replace(/\s+/g, '').trim()
    const bank = String(bankName || '').trim()
    if (!name || !number || !bank) {
      return json(res, 400, { ok: false, error: 'Account name, account number, and bank name are required.' })
    }

    const { data: existing } = await supabase
      .from('user_withdrawal_details')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (existing) {
      return json(res, 409, { ok: false, error: 'Withdrawal details already set. They cannot be changed.' })
    }

    const { error: insertError } = await supabase.from('user_withdrawal_details').insert({
      user_id: userId,
      currency: cur,
      account_name: name,
      account_number: number,
      bank_name: bank,
    })
    if (insertError) return json(res, 500, { ok: false, error: 'Unable to save withdrawal details.' })
    return json(res, 200, { ok: true })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

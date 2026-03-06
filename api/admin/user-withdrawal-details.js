import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

export default async function handler(req, res) {
  if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  const userId = req.query?.userId || req.body?.userId
  if (!userId) return json(res, 400, { ok: false, error: 'userId required.' })

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('user_withdrawal_details')
      .select('bank_name, account_name, account_number, currency')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) return json(res, 500, { ok: false, error: 'Unable to load withdrawal details.' })
    return json(res, 200, {
      ok: true,
      detail: data
        ? {
            bankName: data.bank_name || '',
            accountName: data.account_name || '',
            accountNumber: data.account_number || '',
            currency: data.currency || 'NGN',
          }
        : null,
    })
  }

  if (req.method === 'PATCH') {
    const { bankName, accountName, accountNumber, currency } = req.body || {}
    const bank = String(bankName ?? '').trim()
    const name = String(accountName ?? '').trim()
    const number = String(accountNumber ?? '').replace(/\s+/g, '').trim()
    const cur = String(currency ?? 'NGN').trim() || 'NGN'

    const { data: existing } = await supabase
      .from('user_withdrawal_details')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    const payload = {
      user_id: userId,
      bank_name: bank || null,
      account_name: name || null,
      account_number: number || null,
      currency: cur,
    }

    if (existing) {
      const { error: updateErr } = await supabase
        .from('user_withdrawal_details')
        .update({
          bank_name: payload.bank_name,
          account_name: payload.account_name,
          account_number: payload.account_number,
          currency: payload.currency,
        })
        .eq('user_id', userId)
      if (updateErr) return json(res, 500, { ok: false, error: 'Unable to update withdrawal details.' })
    } else {
      const { error: insertErr } = await supabase.from('user_withdrawal_details').insert(payload)
      if (insertErr) return json(res, 500, { ok: false, error: 'Unable to save withdrawal details.' })
    }
    return json(res, 200, { ok: true })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

export default async function handler(req, res) {
  if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('platform_bank_accounts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load bank accounts.' })
    const list = (data || []).map((r) => ({
      id: r.id,
      bankName: r.bank_name,
      accountName: r.account_name,
      accountNumber: r.account_number,
      currency: r.currency,
      createdAt: r.created_at,
    }))
    return json(res, 200, { ok: true, accounts: list })
  }

  if (req.method === 'POST') {
    const { bankName, accountName, accountNumber, currency } = req.body || {}
    const bank = String(bankName || '').trim()
    const name = String(accountName || '').trim()
    const number = String(accountNumber || '').trim()
    const cur = String(currency || 'USD').trim() || 'USD'
    if (!bank || !name || !number) {
      return json(res, 400, { ok: false, error: 'Bank name, account name, and account number are required.' })
    }
    const { data: inserted, error } = await supabase
      .from('platform_bank_accounts')
      .insert({ bank_name: bank, account_name: name, account_number: number, currency: cur })
      .select()
      .single()
    if (error) return json(res, 500, { ok: false, error: 'Unable to add bank account.' })
    return json(res, 200, {
      ok: true,
      account: {
        id: inserted.id,
        bankName: inserted.bank_name,
        accountName: inserted.account_name,
        accountNumber: inserted.account_number,
        currency: inserted.currency,
        createdAt: inserted.created_at,
      },
    })
  }

  if (req.method === 'DELETE') {
    const id = req.query?.id || req.body?.id
    if (!id) return json(res, 400, { ok: false, error: 'Account id required.' })
    const { error } = await supabase.from('platform_bank_accounts').delete().eq('id', id)
    if (error) return json(res, 500, { ok: false, error: 'Unable to delete.' })
    return json(res, 200, { ok: true })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

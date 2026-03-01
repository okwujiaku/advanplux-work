import { getSupabaseAdmin } from './_lib/auth-utils.js'

function json(res, status, body) {
  res.setHeader('Content-Type', 'application/json')
  res.status(status).end(JSON.stringify(body))
}

/**
 * Public GET: list platform bank accounts for deposit page (all users).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { ok: false, error: 'Method not allowed.' })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, error: 'Service temporarily unavailable.' })
  }

  const { data, error } = await supabase
    .from('platform_bank_accounts')
    .select('id, bank_name, account_name, account_number, currency, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return json(res, 500, { ok: false, error: 'Unable to load bank accounts.' })
  }

  const accounts = (data || []).map((r) => ({
    id: r.id,
    bankName: r.bank_name,
    accountName: r.account_name,
    accountNumber: r.account_number,
    currency: r.currency,
    createdAt: r.created_at,
  }))

  return json(res, 200, { ok: true, accounts })
}

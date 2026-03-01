import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

function mapRow(r) {
  return {
    id: r.id,
    memberId: r.user_id,
    type: r.type,
    amount: Number(r.amount_usd),
    date: r.created_at,
  }
}

export default async function handler(req, res) {
  if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('admin_investment_history').select('*').order('created_at', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load.' })
    return json(res, 200, { ok: true, investmentHistory: (data || []).map(mapRow) })
  }

  if (req.method === 'POST') {
    const { memberId, type, amount } = req.body || {}
    const userId = memberId || req.body?.userId
    const amountUsd = Number(amount)
    if (!userId || !type || !Number.isFinite(amountUsd)) return json(res, 400, { ok: false, error: 'Member, type, and amount required.' })
    const { data: inserted, error } = await supabase
      .from('admin_investment_history')
      .insert({ user_id: userId, type: String(type), amount_usd: amountUsd })
      .select()
      .single()
    if (error) return json(res, 500, { ok: false, error: 'Unable to log.' })
    return json(res, 200, { ok: true, entry: mapRow(inserted) })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

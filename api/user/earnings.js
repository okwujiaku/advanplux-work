import { getCurrentUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'

function mapRow(e) {
  return {
    id: e.id,
    userId: e.user_id,
    source: e.source,
    amountUsd: Number(e.amount_usd),
    note: e.note || null,
    date: e.date,
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
      .from('earnings_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load earnings.' })
    return json(res, 200, { ok: true, earnings: (data || []).map(mapRow) })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const { source, amountUsd, note } = body
    const amount_usd = Number(amountUsd) || 0
    if (!source || String(source).trim() === '') {
      return json(res, 400, { ok: false, error: 'Source is required.' })
    }
    const { data: inserted, error } = await supabase
      .from('earnings_history')
      .insert({
        user_id: userId,
        source: String(source).trim(),
        amount_usd,
        note: note != null ? String(note) : null,
      })
      .select()
      .single()
    if (error) return json(res, 500, { ok: false, error: 'Unable to create earnings entry.' })
    return json(res, 200, { ok: true, earning: mapRow(inserted) })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

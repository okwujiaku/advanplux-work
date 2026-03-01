import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

function mapRow(r) {
  return {
    id: r.id,
    code: r.code,
    value: Number(r.value_usd),
    createdAt: r.created_at,
  }
}

export default async function handler(req, res) {
  if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('gift_codes').select('*').order('created_at', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load gift codes.' })
    return json(res, 200, { ok: true, giftCodes: (data || []).map(mapRow) })
  }

  if (req.method === 'POST') {
    const { value } = req.body || {}
    const valueUsd = Number(value)
    if (!Number.isFinite(valueUsd) || valueUsd <= 0) return json(res, 400, { ok: false, error: 'Valid value (Dollar) required.' })
    const code = `GIFT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const { data: inserted, error } = await supabase
      .from('gift_codes')
      .insert({ code, value_usd: valueUsd })
      .select()
      .single()
    if (error) return json(res, 500, { ok: false, error: 'Unable to create gift code.' })
    return json(res, 200, { ok: true, giftCode: mapRow(inserted) })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

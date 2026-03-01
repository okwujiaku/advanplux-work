import { getSupabaseAdmin } from './_lib/auth-utils.js'

function json(res, status, body) {
  res.setHeader('Content-Type', 'application/json')
  res.status(status).end(JSON.stringify(body))
}

/** Public GET: list announcements for dashboard */
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Service unavailable.' })

  const { data, error } = await supabase.from('announcements').select('id, text, created_at').order('created_at', { ascending: false })
  if (error) return json(res, 500, { ok: false, error: 'Unable to load.' })
  const list = (data || []).map((r) => ({ id: r.id, text: r.text, date: r.created_at }))
  return json(res, 200, { ok: true, announcements: list })
}

import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

function mapRow(r) {
  return { id: r.id, text: r.text, date: r.created_at, createdAt: r.created_at }
}

export default async function handler(req, res) {
  if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load announcements.' })
    return json(res, 200, { ok: true, announcements: (data || []).map(mapRow) })
  }

  if (req.method === 'POST') {
    const { text } = req.body || {}
    const trimmed = String(text || '').trim()
    if (!trimmed) return json(res, 400, { ok: false, error: 'Text required.' })
    const { data: inserted, error } = await supabase
      .from('announcements')
      .insert({ text: trimmed })
      .select()
      .single()
    if (error) return json(res, 500, { ok: false, error: 'Unable to create announcement.' })
    return json(res, 200, { ok: true, announcement: mapRow(inserted) })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

const CONFIG_KEY = 'ad_video_urls'

export default async function handler(req, res) {
  if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, error: 'Backend not configured.' })
  }

  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return json(res, 405, { ok: false, error: 'Method not allowed.' })
  }

  const body = req.body || {}
  const urls = Array.isArray(body.urls) ? body.urls : []
  const normalized = urls
    .map((u) => String(u || '').trim())
    .filter((u) => u && /^https?:\/\//i.test(u))

  const { error } = await supabase
    .from('platform_config')
    .upsert(
      { key: CONFIG_KEY, value: normalized, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    )

  if (error) return json(res, 500, { ok: false, error: 'Failed to save ad videos.' })

  return json(res, 200, { ok: true, urls: normalized })
}

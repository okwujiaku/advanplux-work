import { getSupabaseAdmin, json } from './_lib/auth-utils.js'

const CONFIG_KEY = 'ad_video_urls'

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 200, { ok: true, urls: [] })
  }

  const { data, error } = await supabase
    .from('platform_config')
    .select('value')
    .eq('key', CONFIG_KEY)
    .single()

  if (error || !data?.value) {
    return json(res, 200, { ok: true, urls: [] })
  }

  const urls = Array.isArray(data.value) ? data.value : []
  const normalized = urls
    .map((u) => String(u || '').trim())
    .filter((u) => u && /^https?:\/\//i.test(u))

  return json(res, 200, { ok: true, urls: normalized })
}

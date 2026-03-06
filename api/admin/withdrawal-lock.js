import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

const LOCK_KEY = 'withdrawal_locked'

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', LOCK_KEY)
      .maybeSingle()
    if (error) {
      return json(res, 200, { ok: true, locked: false })
    }
    const locked = data?.value === true
    return json(res, 200, { ok: true, locked })
  }

  if (req.method === 'PATCH' && isAdminRequest(req)) {
    const { lock } = req.body || {}
    const locked = lock === true
    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key: LOCK_KEY, value: locked }, { onConflict: 'key' })
    if (error) return json(res, 500, { ok: false, error: 'Unable to update withdrawal lock.' })
    return json(res, 200, { ok: true, locked })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

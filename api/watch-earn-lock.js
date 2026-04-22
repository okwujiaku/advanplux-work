import { getSupabaseAdmin, json } from './_lib/auth-utils.js'
import { getWatchEarnSettings, isWatchEarnLockedNow } from './_lib/watch-earn-utils.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed.' })
  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })
  const settings = await getWatchEarnSettings(supabase)
  return json(res, 200, {
    ok: true,
    locked: isWatchEarnLockedNow(settings),
    manualLock: !!settings.manualLock,
    sundayLockEnabled: !!settings.sundayLockEnabled,
  })
}


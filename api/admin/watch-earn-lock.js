import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'
import {
  WATCH_EARN_MANUAL_LOCK_KEY,
  WATCH_EARN_SUNDAY_LOCK_KEY,
  getWatchEarnSettings,
  isWatchEarnLockedNow,
} from '../_lib/watch-earn-utils.js'

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  if (req.method === 'GET') {
    const settings = await getWatchEarnSettings(supabase)
    const locked = isWatchEarnLockedNow(settings)
    return json(res, 200, {
      ok: true,
      locked,
      manualLock: !!settings.manualLock,
      sundayLockEnabled: !!settings.sundayLockEnabled,
    })
  }

  if (req.method === 'PATCH' && isAdminRequest(req)) {
    const { lockNow, sundayLockEnabled } = req.body || {}
    const updates = []
    if (lockNow != null) {
      updates.push({ key: WATCH_EARN_MANUAL_LOCK_KEY, value: lockNow === true || lockNow === 'true' })
    }
    if (sundayLockEnabled != null) {
      updates.push({ key: WATCH_EARN_SUNDAY_LOCK_KEY, value: sundayLockEnabled === true || sundayLockEnabled === 'true' })
    }
    if (updates.length === 0) {
      return json(res, 400, { ok: false, error: 'Provide lockNow and/or sundayLockEnabled.' })
    }
    const { error } = await supabase.from('platform_settings').upsert(updates, { onConflict: 'key' })
    if (error) return json(res, 500, { ok: false, error: 'Unable to update Watch & Earn lock settings.' })
    const settings = await getWatchEarnSettings(supabase)
    return json(res, 200, {
      ok: true,
      locked: isWatchEarnLockedNow(settings),
      manualLock: !!settings.manualLock,
      sundayLockEnabled: !!settings.sundayLockEnabled,
    })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}


const DAY_MS = 24 * 60 * 60 * 1000
const PACK_ACTIVE_DAYS = 90

export const WATCH_EARN_MANUAL_LOCK_KEY = 'watch_earn_manual_lock'
export const WATCH_EARN_SUNDAY_LOCK_KEY = 'watch_earn_sunday_lock'

function normalizeBoolean(value) {
  return value === true || value === 'true' || value === 1 || value === '1'
}

function toUtcDayStart(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
}

function countUtcWeekdayBetweenInclusive(startInput, endInput, weekdayUtc) {
  const start = toUtcDayStart(startInput)
  const end = toUtcDayStart(endInput)
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start) return 0
  const totalDays = Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1
  const startDow = start.getUTCDay()
  const offset = (weekdayUtc - startDow + 7) % 7
  if (offset >= totalDays) return 0
  return 1 + Math.floor((totalDays - 1 - offset) / 7)
}

function isPackStillActive(createdAt, now, sundayLockEnabled) {
  if (!createdAt) return false
  const createdTs = new Date(createdAt).getTime()
  if (!Number.isFinite(createdTs)) return false
  const nowDate = now instanceof Date ? now : new Date(now)
  const pausedSundays = sundayLockEnabled ? countUtcWeekdayBetweenInclusive(createdAt, nowDate, 0) : 0
  const effectiveDurationMs = (PACK_ACTIVE_DAYS + pausedSundays) * DAY_MS
  return nowDate.getTime() - createdTs < effectiveDurationMs
}

export async function getWatchEarnSettings(supabase) {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('key, value')
    .in('key', [WATCH_EARN_MANUAL_LOCK_KEY, WATCH_EARN_SUNDAY_LOCK_KEY])
  if (error) {
    return { manualLock: false, sundayLockEnabled: false }
  }
  const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]))
  return {
    manualLock: normalizeBoolean(map[WATCH_EARN_MANUAL_LOCK_KEY]),
    sundayLockEnabled: normalizeBoolean(map[WATCH_EARN_SUNDAY_LOCK_KEY]),
  }
}

export function isWatchEarnLockedNow(settings, now = new Date()) {
  if (settings?.manualLock) return true
  if (settings?.sundayLockEnabled && (now instanceof Date ? now : new Date(now)).getUTCDay() === 0) return true
  return false
}

export function getActivePackUsdList(packsRows, options = {}) {
  const {
    now = new Date(),
    sundayLockEnabled = false,
    legacyPackUsd = null,
  } = options
  const activePacks = Array.isArray(packsRows)
    ? packsRows
      .filter((row) => row && isPackStillActive(row.created_at, now, sundayLockEnabled))
      .map((row) => Number(row.pack_usd))
      .filter((n) => Number.isFinite(n) && n > 0)
    : []
  if (activePacks.length === 0 && legacyPackUsd != null) {
    const legacy = Number(legacyPackUsd)
    if (Number.isFinite(legacy) && legacy > 0) return [legacy]
  }
  return activePacks
}


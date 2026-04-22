import { getEffectiveUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'
import { getActivePackUsdList, getWatchEarnSettings } from '../_lib/watch-earn-utils.js'

const SALARY_TIERS = [
  { investors: 10, salary: 2 },
  { investors: 25, salary: 6 },
  { investors: 50, salary: 15 },
  { investors: 100, salary: 40 },
  { investors: 200, salary: 100 },
  { investors: 500, salary: 300 },
  { investors: 1000, salary: 700 },
]
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * POST: claim weekly team salary. Allowed only once per 7 days. Tier based on direct downlines who have invested.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed.' })

  const userId = getEffectiveUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  // 1) Count direct L1 who have invested (have at least one active pack)
  const { data: level1Rows } = await supabase
    .from('users')
    .select('id')
    .eq('referred_by_user_id', userId)
  const level1Ids = (level1Rows || []).map((r) => r.id)
  if (level1Ids.length === 0) {
    return json(res, 400, { ok: false, error: 'No direct downlines. Team salary is based on direct downlines who have invested.' })
  }

  const [{ data: packsRows }, watchSettings] = await Promise.all([
    supabase
      .from('user_active_packs')
      .select('user_id, pack_usd, created_at')
      .in('user_id', level1Ids)
      .order('created_at', { ascending: true }),
    getWatchEarnSettings(supabase),
  ])
  const groupedByUser = (packsRows || []).reduce((acc, row) => {
    const uid = row?.user_id
    if (!uid) return acc
    if (!acc[uid]) acc[uid] = []
    acc[uid].push(row)
    return acc
  }, {})
  const investedL1Ids = new Set(
    Object.entries(groupedByUser)
      .filter(([, rows]) => getActivePackUsdList(rows, { sundayLockEnabled: !!watchSettings?.sundayLockEnabled }).length > 0)
      .map(([uid]) => uid),
  )
  const directActiveDownlines = investedL1Ids.size

  // 2) Tier from invested count
  const currentTier = SALARY_TIERS.filter((t) => directActiveDownlines >= t.investors).pop()
  if (!currentTier) {
    return json(res, 400, { ok: false, error: `You need at least 10 direct active downlines (who have invested) to claim. You have ${directActiveDownlines}.` })
  }

  const amountUsd = currentTier.salary

  // 3) Last team-salary claim: must be 7+ days ago
  const { data: lastClaims } = await supabase
    .from('earnings_history')
    .select('date')
    .eq('user_id', userId)
    .eq('source', 'team-salary')
    .order('date', { ascending: false })
    .limit(1)
  const lastClaimDate = lastClaims?.[0]?.date
  if (lastClaimDate) {
    const lastTs = new Date(lastClaimDate).getTime()
    if (Date.now() - lastTs < COOLDOWN_MS) {
      const nextClaimAt = lastTs + COOLDOWN_MS
      return json(res, 400, {
        ok: false,
        error: 'You can claim again 7 days after your last claim.',
        nextClaimAt: new Date(nextClaimAt).toISOString(),
      })
    }
  }

  // 4) Insert earning and credit wallet
  const now = new Date().toISOString()
  const { data: inserted, error: insertErr } = await supabase
    .from('earnings_history')
    .insert({
      user_id: userId,
      source: 'team-salary',
      amount_usd: amountUsd,
      note: 'Weekly team salary claimed',
    })
    .select()
    .single()
  if (insertErr) return json(res, 500, { ok: false, error: 'Unable to record claim.' })

  const { data: wRow } = await supabase.from('user_wallet').select('balance_usd').eq('user_id', userId).maybeSingle()
  const cur = wRow ? Number(wRow.balance_usd) : 0
  const next = Number((cur + amountUsd).toFixed(2))
  const { error: upsertErr } = await supabase.from('user_wallet').upsert(
    { user_id: userId, balance_usd: next, updated_at: now },
    { onConflict: 'user_id' },
  )
  if (upsertErr) return json(res, 500, { ok: false, error: 'Claim recorded but wallet update failed. Contact support.' })

  return json(res, 200, {
    ok: true,
    amountUsd,
    balanceUsd: next,
    nextClaimAt: new Date(Date.now() + COOLDOWN_MS).toISOString(),
  })
}

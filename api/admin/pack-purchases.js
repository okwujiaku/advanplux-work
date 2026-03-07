import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'

/** Combined pack purchase history: approved deposits with pack + activations from user_active_packs */
export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Method not allowed.' })
  if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) return json(res, 503, { ok: false, error: 'Backend not configured.' })

  const [depositsRes, packsRes] = await Promise.all([
    supabase.from('deposits').select('id, user_id, pack, amount, currency, approved_at, date, status').eq('status', 'approved').not('pack', 'is', null).order('created_at', { ascending: false }),
    supabase.from('user_active_packs').select('id, user_id, pack_usd, created_at').order('created_at', { ascending: false }),
  ])

  if (depositsRes.error) return json(res, 500, { ok: false, error: 'Unable to load deposits.' })
  if (packsRes.error) return json(res, 500, { ok: false, error: 'Unable to load pack activations.' })

  const fromDeposits = (depositsRes.data || []).map((d) => ({
    id: d.id,
    userId: d.user_id,
    pack: d.pack != null ? Number(d.pack) : null,
    amount: d.amount,
    currency: d.currency || '',
    date: d.approved_at || d.date,
    source: 'deposit',
  }))

  const fromActivations = (packsRes.data || []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    pack: Number(p.pack_usd) || null,
    amount: null,
    currency: 'From balance',
    date: p.created_at,
    source: 'activation',
  }))

  const merged = [...fromDeposits, ...fromActivations].sort((a, b) => new Date(b.date) - new Date(a.date))
  return json(res, 200, { ok: true, purchases: merged })
}

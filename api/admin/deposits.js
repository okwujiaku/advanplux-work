import { getSupabaseAdmin, isAdminRequest, json } from '../_lib/auth-utils.js'
import {
  WATCH_EARN_AUTO_USD,
  deriveAmountUsdFromDepositRow,
  isWatchEarnAutoDepositRow,
} from '../_lib/watch-earn-auto-deposit.js'

function mapRow(d) {
  return {
    id: d.id,
    userId: d.user_id,
    amount: d.amount,
    amountUsd: Number(d.amount_usd),
    currency: d.currency,
    country: d.country,
    paymentType: d.payment_type,
    accountName: d.account_name || '',
    accountNumber: d.account_number || '',
    bankName: d.bank_name || '',
    accountUsed: d.account_used || '',
    pack: d.pack,
    date: d.date || d.created_at,
    status: d.status || 'pending',
    approvedAt: d.approved_at || null,
    rejectedAt: d.rejected_at || null,
    reversedAt: d.reversed_at || null,
  }
}

export default async function handler(req, res) {
  if (!isAdminRequest(req)) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load deposits.' })
    return json(res, 200, { ok: true, deposits: (data || []).map(mapRow) })
  }

  const id = req.query?.id || req.body?.id
  if (req.method === 'PATCH' && id) {
    const { status } = req.body || {}
    const s = String(status || '').toLowerCase()
    if (!['approved', 'rejected', 'reversed'].includes(s)) {
      return json(res, 400, { ok: false, error: 'Invalid status.' })
    }
    const { data: row, error: fetchErr } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', id)
      .single()
    if (fetchErr || !row) return json(res, 404, { ok: false, error: 'Deposit not found.' })
    if (row.status !== 'pending' && s !== 'reversed') {
      return json(res, 400, { ok: false, error: 'Deposit is not pending.' })
    }
    const now = new Date().toISOString()
    let creditedAmountUsd = 0
    let newBalanceUsd = 0
    const isBalanceActivation = String(row.payment_type || '') === 'balance_activation'
    const isWatchEarnAuto = isWatchEarnAutoDepositRow(row)

    // For approval: credit wallet first, then update deposit (so we never mark approved without crediting).
    if (s === 'approved') {
      if (isWatchEarnAuto) {
        const amountUsd = deriveAmountUsdFromDepositRow(row)
        if (Math.abs(amountUsd - WATCH_EARN_AUTO_USD) > 0.05) {
          return json(res, 400, {
            ok: false,
            error: `Watch Earn Auto payment must be $${WATCH_EARN_AUTO_USD} USD (after currency conversion).`,
          })
        }
        // Fee unlocks auto-task only; do not credit wallet.
      } else if (isBalanceActivation) {
        const packUsd = Number(row.pack || row.amount_usd || 0)
        if (!row.user_id || !Number.isFinite(packUsd) || packUsd <= 0) {
          return json(res, 400, { ok: false, error: 'Invalid balance activation request.' })
        }
        const { error: activateErr } = await supabase.from('user_active_packs').insert({
          user_id: row.user_id,
          pack_usd: packUsd,
        })
        if (activateErr) {
          return json(res, 500, { ok: false, error: 'Unable to activate pack for this request.' })
        }
        // Keep affiliate rewards behavior consistent with direct activation flow.
        const REFERRAL_RATES = { 1: 0.1, 2: 0.02, 3: 0.01 }
        try {
          const { data: activator } = await supabase.from('users').select('referred_by_user_id').eq('id', row.user_id).maybeSingle()
          let l1Id = activator?.referred_by_user_id || null
          if (l1Id) {
            const { data: l1User } = await supabase.from('users').select('referred_by_user_id').eq('id', l1Id).maybeSingle()
            const l2Id = l1User?.referred_by_user_id || null
            let l3Id = null
            if (l2Id) {
              const { data: l2User } = await supabase.from('users').select('referred_by_user_id').eq('id', l2Id).maybeSingle()
              l3Id = l2User?.referred_by_user_id || null
            }
            const referrers = [
              { id: l1Id, level: 1 },
              ...(l2Id ? [{ id: l2Id, level: 2 }] : []),
              ...(l3Id ? [{ id: l3Id, level: 3 }] : []),
            ]
            for (const { id: referrerId, level } of referrers) {
              const rate = REFERRAL_RATES[level]
              const amountUsd = Number((packUsd * rate).toFixed(2))
              if (amountUsd <= 0) continue
              await supabase.from('earnings_history').insert({
                user_id: referrerId,
                from_user_id: row.user_id,
                source: `referral-level${level}`,
                amount_usd: amountUsd,
                note: `Affiliate ${level === 1 ? '10' : level === 2 ? '2' : '1'}% of $${packUsd} pack`,
              })
              const { data: wRow } = await supabase.from('user_wallet').select('balance_usd').eq('user_id', referrerId).maybeSingle()
              const cur = wRow ? Number(wRow.balance_usd) : 0
              const next = Number((cur + amountUsd).toFixed(2))
              await supabase.from('user_wallet').upsert({ user_id: referrerId, balance_usd: next, updated_at: now }, { onConflict: 'user_id' })
            }
          }
        } catch {
          // Do not fail activation if referral commission fails.
        }
      } else {
        const userId = row.user_id
        let amountUsd = Number(row.amount_usd) || 0
        const rawAmount = row.amount != null ? String(row.amount).replace(/\s/g, '') : ''
        const localAmount = Number(rawAmount) || 0
        const cur = (row.currency && String(row.currency).toUpperCase()) || ''
        if (amountUsd <= 0 && localAmount > 0) {
          if (cur === 'NGN') amountUsd = Math.round((localAmount / 1450) * 100) / 100
          else if (cur === 'CFA') amountUsd = Math.round((localAmount / 600) * 100) / 100
          else if (cur === 'RWF') amountUsd = Math.round((localAmount / 1500) * 100) / 100
        }
        if (!userId) {
          return json(res, 500, { ok: false, error: 'Deposit has no user. Cannot credit balance.' })
        }
        if (amountUsd <= 0) {
          return json(res, 400, { ok: false, error: 'Deposit has no amount in USD. Use amount (local) and currency to derive, or add amount_usd.' })
        }
        const { data: walletRow, error: walletFetchErr } = await supabase
          .from('user_wallet')
          .select('balance_usd')
          .eq('user_id', userId)
          .maybeSingle()
        if (walletFetchErr) {
          console.error('Deposit approve: failed to fetch user_wallet', walletFetchErr)
          return json(res, 500, { ok: false, error: 'Could not load user wallet.' })
        }
        const currentBalance = Number(walletRow?.balance_usd ?? 0) || 0
        const newBalance = Math.round((currentBalance + amountUsd) * 100) / 100
        creditedAmountUsd = amountUsd
        newBalanceUsd = newBalance
        const { error: walletErr } = await supabase
          .from('user_wallet')
          .upsert(
            { user_id: userId, balance_usd: newBalance, updated_at: now },
            { onConflict: 'user_id' },
          )
        if (walletErr) {
          console.error('Deposit approve: failed to update user_wallet', walletErr)
          return json(res, 500, { ok: false, error: 'Deposit approved but failed to update user balance.' })
        }
      }
      // Referral commission is paid only when they activate a pack (wallet.js), not on deposit, so we don't double-credit.
    }

    // For balance activation rejection, refund reserved wallet funds.
    if (s === 'rejected' && isBalanceActivation) {
      const userId = row.user_id
      const amountUsd = Number(row.amount_usd || row.pack || 0)
      if (userId && Number.isFinite(amountUsd) && amountUsd > 0) {
        const { data: walletRow, error: walletFetchErr } = await supabase
          .from('user_wallet')
          .select('balance_usd')
          .eq('user_id', userId)
          .maybeSingle()
        if (walletFetchErr) return json(res, 500, { ok: false, error: 'Could not load user wallet for refund.' })
        const currentBalance = Number(walletRow?.balance_usd ?? 0) || 0
        const refundBalance = Math.round((currentBalance + amountUsd) * 100) / 100
        const { error: walletErr } = await supabase
          .from('user_wallet')
          .upsert(
            { user_id: userId, balance_usd: refundBalance, updated_at: now },
            { onConflict: 'user_id' },
          )
        if (walletErr) return json(res, 500, { ok: false, error: 'Unable to refund reserved activation balance.' })
      }
    }

    const updates = {}
    if (s === 'approved') {
      updates.status = 'approved'
      updates.approved_at = now
    } else if (s === 'rejected') {
      updates.status = 'rejected'
      updates.rejected_at = now
    } else {
      updates.status = 'reversed'
      updates.reversed_at = now
    }
    const { data: updated, error: updateErr } = await supabase
      .from('deposits')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (updateErr) return json(res, 500, { ok: false, error: 'Unable to update deposit.' })

    const payload = { ok: true, deposit: mapRow(updated) }
    if (s === 'approved' && creditedAmountUsd > 0) {
      payload.creditedAmountUsd = creditedAmountUsd
      payload.newBalanceUsd = newBalanceUsd
    }
    return json(res, 200, payload)
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

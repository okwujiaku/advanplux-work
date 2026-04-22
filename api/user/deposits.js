import { getEffectiveUserIdFromRequest, getSupabaseAdmin, json } from '../_lib/auth-utils.js'
import {
  WATCH_EARN_AUTO_PACK,
  WATCH_EARN_AUTO_PAYMENT_TYPE,
  WATCH_EARN_AUTO_USD,
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
  const userId = getEffectiveUserIdFromRequest(req)
  if (!userId) return json(res, 401, { ok: false, error: 'Unauthorized.' })

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return json(res, 503, { ok: false, code: 'BACKEND_NOT_CONFIGURED', error: 'Supabase backend is not configured.' })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) return json(res, 500, { ok: false, error: 'Unable to load deposits.' })
    return json(res, 200, { ok: true, deposits: (data || []).map(mapRow) })
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    let { amount, amountUsd, currency, country, paymentType, accountName, accountNumber, bankName, accountUsed, pack } = body

    const isWatchEarnAuto =
      String(pack || '') === WATCH_EARN_AUTO_PACK || String(paymentType || '') === WATCH_EARN_AUTO_PAYMENT_TYPE

    if (isWatchEarnAuto) {
      pack = WATCH_EARN_AUTO_PACK
      paymentType = WATCH_EARN_AUTO_PAYMENT_TYPE
      const { data: existingApproved, error: apprErr } = await supabase
        .from('deposits')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .or(`pack.eq.${WATCH_EARN_AUTO_PACK},payment_type.eq.${WATCH_EARN_AUTO_PAYMENT_TYPE}`)
        .limit(1)
        .maybeSingle()
      if (apprErr) {
        return json(res, 500, { ok: false, error: 'Unable to verify Watch Earn Auto purchase.' })
      }
      if (existingApproved) {
        return json(res, 400, {
          ok: false,
          error: 'You already have an approved Watch Earn Auto add-on.',
          code: 'WATCH_EARN_AUTO_ALREADY_APPROVED',
        })
      }
      const { data: pendingAddon, error: pendAddonErr } = await supabase
        .from('deposits')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .or(`pack.eq.${WATCH_EARN_AUTO_PACK},payment_type.eq.${WATCH_EARN_AUTO_PAYMENT_TYPE}`)
        .limit(1)
        .maybeSingle()
      if (pendAddonErr) {
        return json(res, 500, { ok: false, error: 'Unable to verify pending Watch Earn Auto payment.' })
      }
      if (pendingAddon) {
        return json(res, 400, {
          ok: false,
          error: 'You already have a pending Watch Earn Auto payment. Wait for admin approval.',
          code: 'WATCH_EARN_AUTO_PENDING_EXISTS',
        })
      }
    } else {
      // Prevent multiple pending deposits: user must wait for admin to approve
      const { data: existingPending, error: pendingErr } = await supabase
        .from('deposits')
        .select('id, status')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .neq('payment_type', 'balance_activation')
        .neq('payment_type', WATCH_EARN_AUTO_PAYMENT_TYPE)
        .limit(1)
        .maybeSingle()
      if (pendingErr) {
        return json(res, 500, { ok: false, error: 'Unable to check existing deposits. Please try again.' })
      }
      if (existingPending) {
        return json(res, 400, {
          ok: false,
          error: 'You already have a pending deposit. Please wait for it to be approved before submitting another.',
          code: 'DEPOSIT_PENDING_EXISTS',
        })
      }
    }

    let amount_usd = Number(amountUsd) || 0
    let amount_for_insert = amount != null ? String(amount) : null

    if (isWatchEarnAuto) {
      amount_usd = WATCH_EARN_AUTO_USD
      const cur = String(currency || '').toUpperCase()
      if (cur === 'NGN') amount_for_insert = String(Math.round(WATCH_EARN_AUTO_USD * 1450))
      else if (cur === 'CFA') amount_for_insert = String(Math.round(WATCH_EARN_AUTO_USD * 600))
      else if (cur === 'RWF') amount_for_insert = String(Math.round(WATCH_EARN_AUTO_USD * 1500))
      else {
        return json(res, 400, { ok: false, error: 'Select Nigeria, Cameroon, or Rwanda to pay for Watch Earn Auto.' })
      }
    } else if (amount_usd <= 0 && amount != null && currency) {
      const local = Number(String(amount).replace(/\s/g, '')) || 0
      const cur = String(currency).toUpperCase()
      if (cur === 'NGN' && local > 0) amount_usd = Math.round((local / 1450) * 100) / 100
      else if (cur === 'CFA' && local > 0) amount_usd = Math.round((local / 600) * 100) / 100
      else if (cur === 'RWF' && local > 0) amount_usd = Math.round((local / 1500) * 100) / 100
    }
    const { data: inserted, error } = await supabase
      .from('deposits')
      .insert({
        user_id: userId,
        amount: amount_for_insert,
        amount_usd,
        currency: currency || null,
        country: country || null,
        payment_type: paymentType || null,
        account_name: accountName || null,
        account_number: accountNumber || null,
        bank_name: bankName || null,
        account_used: accountUsed || null,
        pack: pack != null ? pack : null,
        status: 'pending',
      })
      .select()
      .single()
    if (error) return json(res, 500, { ok: false, error: 'Unable to create deposit.' })
    return json(res, 200, { ok: true, deposit: mapRow(inserted) })
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

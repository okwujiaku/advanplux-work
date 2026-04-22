export const WATCH_EARN_AUTO_PACK = 'watch_earn_auto'
export const WATCH_EARN_AUTO_PAYMENT_TYPE = 'watch_earn_auto'
export const WATCH_EARN_AUTO_USD = 10

export function isWatchEarnAutoDepositRow(row) {
  if (!row) return false
  return (
    String(row.pack || '') === WATCH_EARN_AUTO_PACK ||
    String(row.payment_type || '') === WATCH_EARN_AUTO_PAYMENT_TYPE
  )
}

export function deriveAmountUsdFromDepositRow(row) {
  let amountUsd = Number(row.amount_usd) || 0
  const rawAmount = row.amount != null ? String(row.amount).replace(/\s/g, '') : ''
  const localAmount = Number(rawAmount) || 0
  const cur = (row.currency && String(row.currency).toUpperCase()) || ''
  if (amountUsd <= 0 && localAmount > 0) {
    if (cur === 'NGN') amountUsd = Math.round((localAmount / 1450) * 100) / 100
    else if (cur === 'CFA') amountUsd = Math.round((localAmount / 600) * 100) / 100
    else if (cur === 'RWF') amountUsd = Math.round((localAmount / 1500) * 100) / 100
  }
  return amountUsd
}

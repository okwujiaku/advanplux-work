import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const USD_TO_NGN = 1450
const USD_TO_CFA = 600
const MIN_WITHDRAWAL_USD = 3
const WITHDRAWAL_FEE_RATE = 0.1

function RequestWithdrawal() {
  const { walletUsd, savedWithdrawalDetails, addWithdrawal } = useApp()
  const [amountUsd, setAmountUsd] = useState('')
  const [currency, setCurrency] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const savedDetail = savedWithdrawalDetails?.[0] || null
  const amount = parseFloat(amountUsd) || 0
  const feeUsd = Math.round(amount * WITHDRAWAL_FEE_RATE * 100) / 100
  const netAmountUsd = Math.max(0, Math.round((amount - feeUsd) * 100) / 100)
  const equivalentNgn = netAmountUsd * USD_TO_NGN
  const equivalentCfa = netAmountUsd * USD_TO_CFA
  const balance = Number(walletUsd || 0)
  const canSubmit = amount >= MIN_WITHDRAWAL_USD && amount <= balance && savedDetail && (currency === 'NGN' || currency === 'CFA')
  const showExchange = currency === 'NGN' || currency === 'CFA'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setError('')
    setSubmitting(true)
    try {
      const id = await addWithdrawal({
        amountUsd: amount,
        feeUsd,
        netAmountUsd: netAmountUsd,
        currency,
        accountNumber: savedDetail.accountNumber || '',
        accountName: savedDetail.accountName || '',
        bankName: savedDetail.bankName || '',
      })
      if (id) {
        setSubmitted(true)
        setAmountUsd('')
      } else {
        setError('Could not submit. Try again.')
      }
    } catch {
      setError('Something went wrong. Try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request withdrawal</h1>
        <p className="text-gray-600 mt-1">
          Enter the amount you want to withdraw in dollars. Your payout will be sent to your saved withdrawal account after admin approval.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <p className="text-sm text-gray-500 mb-1">Available balance</p>
        <p className="text-2xl font-bold text-gray-900">${balance.toFixed(2)}</p>
      </div>

      {!savedDetail ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-2">Add withdrawal details first</h2>
          <p className="text-amber-800 text-sm mb-4">
            To request a withdrawal, you need to add your payout account (bank or mobile money) once. You can do this from the Menu.
          </p>
          <Link
            to="/dashboard/withdrawal"
            className="inline-flex px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
          >
            Go to Withdrawal details (Menu)
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Withdrawal amount</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: ${MIN_WITHDRAWAL_USD}. Withdrawal fee: {(WITHDRAWAL_FEE_RATE * 100).toFixed(0)}%.</p>
              {amount > 0 && amount < MIN_WITHDRAWAL_USD && (
                <p className="text-red-600 text-sm mt-1">Minimum withdrawal is ${MIN_WITHDRAWAL_USD}.</p>
              )}
              {amount >= MIN_WITHDRAWAL_USD && (
                <p className="text-sm text-gray-600 mt-1">Fee: ${feeUsd.toFixed(2)} · You receive: ${netAmountUsd.toFixed(2)} USD</p>
              )}
              {amount > balance && (
                <p className="text-red-600 text-sm mt-1">Amount cannot exceed your balance (${balance.toFixed(2)}).</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payout currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select currency</option>
                <option value="NGN">NGN (Naira)</option>
                <option value="CFA">CFA</option>
              </select>
            </div>

            {showExchange && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Exchange rate — you will receive</p>
                {currency === 'NGN' && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-800 mb-1">Nigeria — NGN (Naira)</p>
                    <p className="text-xs text-gray-500 mb-2">1 USD = ₦{USD_TO_NGN.toLocaleString()}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      You receive: ₦{equivalentNgn.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                )}
                {currency === 'CFA' && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-800 mb-1">Cameroon — CFA</p>
                    <p className="text-xs text-gray-500 mb-2">1 USD = CFA {USD_TO_CFA.toLocaleString()}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      You receive: CFA {equivalentCfa.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {submitted && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                Request submitted. It will be processed after admin approval. You can track it under Withdrawal history in the Menu.
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Submitting…' : 'Request withdrawal'}
            </button>
          </form>

          <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">Payout account (from withdrawal details)</p>
            <p>{savedDetail.accountName} · {savedDetail.accountNumber} · {savedDetail.bankName} ({savedDetail.currency})</p>
            <Link to="/dashboard/withdrawal" className="text-primary-600 hover:underline mt-1 inline-block">View in Menu → Withdrawal details</Link>
          </div>
        </>
      )}
    </div>
  )
}

export default RequestWithdrawal

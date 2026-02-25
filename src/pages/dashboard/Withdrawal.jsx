import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'

const EXCHANGE_RATES = {
  NGN: 1450,
  CFA: 600,
}
const WITHDRAWAL_FEE_RATE = 0.1
const MIN_WITHDRAWAL_USD = 3

function Withdrawal() {
  const { addWithdrawal, savedWithdrawalDetails, withdrawals, walletUsd } = useApp()
  const [amountUsd, setAmountUsd] = useState('')
  const [currency, setCurrency] = useState('NGN')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [selectedDetailId, setSelectedDetailId] = useState('new')
  const [saveForNextTime, setSaveForNextTime] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  const usdValue = Number(amountUsd) || 0
  const grossConvertedAmount = usdValue * EXCHANGE_RATES[currency]
  const feeUsd = usdValue * WITHDRAWAL_FEE_RATE
  const netUsd = Math.max(0, usdValue - feeUsd)
  const feeConvertedAmount = grossConvertedAmount * WITHDRAWAL_FEE_RATE
  const convertedAmount = Math.max(0, grossConvertedAmount - feeConvertedAmount)
  const matchingSavedDetails = useMemo(
    () => savedWithdrawalDetails.filter((detail) => detail.currency === currency),
    [currency, savedWithdrawalDetails],
  )
  const selectedSavedDetail = matchingSavedDetails.find((detail) => detail.id === selectedDetailId) || null
  const usingSavedDetail = selectedDetailId !== 'new' && !!selectedSavedDetail

  useEffect(() => {
    if (matchingSavedDetails.length > 0) {
      setSelectedDetailId(matchingSavedDetails[0].id)
      return
    }
    setSelectedDetailId('new')
  }, [currency, matchingSavedDetails])

  const handleSubmit = () => {
    if (!usdValue || usdValue < MIN_WITHDRAWAL_USD) return
    if (usdValue > walletUsd) return
    const resolvedAccountName = usingSavedDetail ? selectedSavedDetail.accountName : accountName.trim()
    const resolvedAccountNumber = usingSavedDetail ? selectedSavedDetail.accountNumber : accountNumber.trim()
    const resolvedBankName = usingSavedDetail ? selectedSavedDetail.bankName : bankName.trim()
    if (!resolvedAccountName) return
    if (!resolvedAccountNumber) return
    if (currency === 'NGN' && !resolvedBankName) return
    addWithdrawal({
      userId: 'current-user',
      amount: convertedAmount,
      amountUsd: usdValue,
      feeUsd,
      netAmountUsd: netUsd,
      feeAmount: feeConvertedAmount,
      currency,
      accountName: resolvedAccountName,
      accountNumber: resolvedAccountNumber,
      bankName: currency === 'NGN' ? resolvedBankName : 'Mobile Money',
      saveDetail: !usingSavedDetail && saveForNextTime,
    })
    setSubmitted(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Withdrawal</h1>
        <p className="text-gray-600 mt-1">
          Enter withdrawal amount in USD, choose payout currency, and submit once. Saved details can be reused.
        </p>
        <p className="text-primary-700 text-sm mt-2">Available balance: ${walletUsd.toFixed(2)}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Request withdrawal</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min={MIN_WITHDRAWAL_USD}
                step="0.01"
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                placeholder="e.g. 10"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Amount is entered in USD. Minimum withdrawal is ${MIN_WITHDRAWAL_USD}.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="NGN">NGN (Naira) - Nigeria</option>
              <option value="CFA">CFA - Cameroon</option>
            </select>
            <p className="text-sm text-primary-700 mt-2">
              Gross amount: {currency === 'NGN' ? '₦' : 'CFA '}
              {grossConvertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Withdrawal fee (10%): {currency === 'NGN' ? '₦' : 'CFA '}
              {feeConvertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-green-700 mt-1 font-medium">
              You will receive: {currency === 'NGN' ? '₦' : 'CFA '}
              {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>

          {matchingSavedDetails.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Use saved payout details or add new</label>
              <select
                value={selectedDetailId}
                onChange={(e) => setSelectedDetailId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                {matchingSavedDetails.map((detail) => (
                  <option key={detail.id} value={detail.id}>
                    {detail.accountName || 'Saved account'} - {detail.accountNumber}
                  </option>
                ))}
                <option value="new">+ Add new payout details</option>
              </select>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {currency === 'NGN' ? 'Bank account details (NGN payout)' : 'Mobile Money details (CFA payout)'}
            </h3>
            <p className="text-xs text-gray-500">
              {currency === 'NGN'
                ? 'Provide your bank account details for Naira payout.'
                : 'Provide your Mobile Money details for CFA payout.'}
            </p>
          </div>

          {!usingSavedDetail && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {currency === 'NGN' ? 'Account name' : 'Mobile money network'}
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder={currency === 'NGN' ? 'Your bank account name' : 'Your Mobile money network'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              {currency === 'NGN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Your bank name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {currency === 'NGN' ? 'Account number' : 'Mobile Money number'}
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={currency === 'NGN' ? 'Your bank account number' : 'Your Mobile Money number'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={saveForNextTime}
                  onChange={(e) => setSaveForNextTime(e.target.checked)}
                />
                Save these payout details for future withdrawals
              </label>
            </>
          )}

          {usingSavedDetail && (
            <div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 space-y-1">
                <p>Using saved detail: {selectedSavedDetail.accountName || 'Saved account'}</p>
                <p>Number: {selectedSavedDetail.accountNumber}</p>
                {selectedSavedDetail.bankName && <p>Bank: {selectedSavedDetail.bankName}</p>}
              </div>
            </div>
          )}
        </div>
        {submitted ? (
          <p className="text-green-600 font-medium mt-4">Withdrawal request submitted. Status: pending approval.</p>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={
              !amountUsd ||
              usdValue < MIN_WITHDRAWAL_USD ||
              usdValue > walletUsd ||
              (!usingSavedDetail &&
                (!accountName.trim() || !accountNumber.trim() || (currency === 'NGN' && !bankName.trim())))
            }
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            Submit request
          </button>
        )}
        {usdValue > walletUsd && (
          <p className="text-sm text-red-600 mt-2">
            Insufficient balance for this withdrawal request.
          </p>
        )}
        {usdValue > 0 && usdValue < MIN_WITHDRAWAL_USD && (
          <p className="text-sm text-red-600 mt-2">
            Minimum withdrawal is ${MIN_WITHDRAWAL_USD}.
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Your withdrawal history</h2>
        {withdrawals.filter((w) => w.userId === 'current-user').length === 0 ? (
          <p className="text-sm text-gray-500">No withdrawal requests yet.</p>
        ) : (
          <div className="space-y-2">
            {withdrawals
              .filter((w) => w.userId === 'current-user')
              .slice(0, 6)
              .map((w) => (
                <div key={w.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      ${Number(w.amountUsd || 0).toFixed(2)} (fee: ${Number(w.feeUsd || 0).toFixed(2)})
                    </p>
                    <p className="text-gray-700">
                      Net payout: {w.currency} {Number(w.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-gray-500">{new Date(w.date).toLocaleString()}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      w.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : w.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : w.status === 'reversed'
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Withdrawal

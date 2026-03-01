import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const COUNTRIES = [
  { id: 'nigeria', name: 'Nigeria', currency: 'NGN', paymentType: 'Bank Account', ready: true },
  { id: 'cameroon', name: 'Cameroon', currency: 'CFA', paymentType: 'Mobile Money', ready: true },
  { id: 'ghana', name: 'Ghana', currency: 'GHS', paymentType: 'Mobile Money', ready: false },
  { id: 'rwanda', name: 'Rwanda', currency: 'RWF', paymentType: 'Mobile Money', ready: false },
  { id: 'kenya', name: 'Kenya', currency: 'KES', paymentType: 'M-Pesa', ready: false },
  { id: 'uganda', name: 'Uganda', currency: 'UGX', paymentType: 'Mobile Money', ready: false },
]

const USD_TO_NGN = 1450
const USD_TO_CFA = 600

function Deposit() {
  const navigate = useNavigate()
  const { addDeposit } = useApp()
  const [amountUsd, setAmountUsd] = useState('')
  const [country, setCountry] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [platformBankAccounts, setPlatformBankAccounts] = useState([])
  const [selectedPaymentAccountId, setSelectedPaymentAccountId] = useState('')

  const amount = parseFloat(amountUsd) || 0
  const nairaAmount = Math.round(amount * USD_TO_NGN)
  const cfaAmount = Math.round(amount * USD_TO_CFA)

  const countryConfig = COUNTRIES.find((c) => c.id === country)
  const isReady = !!countryConfig?.ready
  const selectedCurrency = country === 'nigeria' ? 'NGN' : country === 'cameroon' ? 'CFA' : ''
  const availablePaymentAccounts = useMemo(
    () => platformBankAccounts.filter((account) => account.currency === selectedCurrency),
    [platformBankAccounts, selectedCurrency],
  )
  const selectedPaymentAccount =
    availablePaymentAccounts.find((account) => account.id === selectedPaymentAccountId) ||
    availablePaymentAccounts[0] ||
    null

  useEffect(() => {
    setSelectedPaymentAccountId(availablePaymentAccounts[0]?.id || '')
  }, [country, availablePaymentAccounts])

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const response = await fetch('/api/platform-bank-accounts', { signal: controller.signal })
        const payload = await response.json()
        if (response.ok && payload?.ok && Array.isArray(payload.accounts)) {
          setPlatformBankAccounts(payload.accounts)
        }
      } catch {
        // keep existing state (e.g. from localStorage) so nothing disappears when API fails
      }
    }
    load()
    return () => controller.abort()
  }, [])

  const handleSubmitPayment = () => {
    if (!isReady) return
    if (!fullName.trim()) return
    if (!selectedPaymentAccount) return
    if (amount <= 0) return
    addDeposit({
      userId: 'current-user',
      amount: country === 'nigeria' ? nairaAmount : cfaAmount,
      amountUsd: amount,
      currency: country === 'nigeria' ? 'NGN' : 'CFA',
      country: countryConfig.name,
      paymentType: countryConfig.paymentType,
      accountNumber: selectedPaymentAccount.accountNumber || '',
      accountName: fullName.trim(),
      bankName: selectedPaymentAccount.bankName || '',
      accountUsed: selectedPaymentAccount.accountNumber || '',
      saveDetail: false,
    })
    setSubmitted(true)
    setTimeout(() => navigate('/dashboard'), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deposit</h1>
        <p className="text-gray-600 mt-1">
          Add funds to your balance. After approval you can use the balance to activate Ads Engine.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Amount to deposit (USD)</h2>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amountUsd}
          onChange={(e) => setAmountUsd(e.target.value)}
          placeholder="0.00"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Country / currency selection (like Request Withdrawal) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select country</h2>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        >
          <option value="">Select country / currency</option>
          {COUNTRIES.filter((c) => c.ready).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.currency})
            </option>
          ))}
        </select>

        {amount > 0 && country && (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Exchange rate — Make payment to the Details below</p>
            {country === 'nigeria' && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">Nigeria — NGN (Naira)</p>
                <p className="text-xs text-gray-500 mb-2">1 USD = ₦{USD_TO_NGN.toLocaleString()}</p>
                <p className="text-lg font-semibold text-gray-900">
                  You&apos;ll deposit: ₦{nairaAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            )}
            {country === 'cameroon' && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">Cameroon — CFA</p>
                <p className="text-xs text-gray-500 mb-2">1 USD = CFA {USD_TO_CFA.toLocaleString()}</p>
                <p className="text-lg font-semibold text-gray-900">
                  You&apos;ll deposit: CFA {cfaAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment details by country */}
      {isReady && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {country === 'nigeria' ? 'Bank account (Nigeria)' : 'Mobile Money (Cameroon)'}
          </h2>
          {availablePaymentAccounts.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-1">Select payment account</label>
              <select
                value={selectedPaymentAccountId}
                onChange={(e) => setSelectedPaymentAccountId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                {availablePaymentAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bankName} - {account.accountNumber}
                  </option>
                ))}
              </select>
            </div>
          )}
          {!selectedPaymentAccount && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              No payment account configured for {selectedCurrency}. Add one from Admin &gt; Add Bank Account.
            </div>
          )}
          {country === 'nigeria' && selectedPaymentAccount && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Account name</p>
                <p className="font-medium">{selectedPaymentAccount.accountName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account number</p>
                <p className="font-mono font-medium">{selectedPaymentAccount.accountNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bank</p>
                <p className="font-medium">{selectedPaymentAccount.bankName || '-'}</p>
              </div>
            </div>
          )}
          {country === 'cameroon' && selectedPaymentAccount && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Mobile money network</p>
                <p className="font-medium">{selectedPaymentAccount.bankName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile Money number</p>
                <p className="font-mono font-medium">{selectedPaymentAccount.accountNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account name</p>
                <p className="font-medium">{selectedPaymentAccount.accountName || '-'}</p>
              </div>
            </div>
          )}

        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Your full name</h2>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        />
      </div>

      {submitted ? (
        <p className="text-center text-green-600 font-medium">Payment submitted. Waiting for admin confirmation. Redirecting...</p>
      ) : (
        <div className="flex gap-3">
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmitPayment}
            disabled={!isReady || !fullName.trim() || !selectedPaymentAccount || amount <= 0}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            I have made the payment
          </button>
        </div>
      )}
    </div>
  )
}

export default Deposit

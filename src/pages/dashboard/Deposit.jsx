import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const COUNTRIES = [
  { id: 'nigeria', name: 'Nigeria', currency: 'NGN', paymentType: 'Bank Account', ready: true },
  { id: 'cameroon', name: 'Cameroon', currency: 'CFA', paymentType: 'Mobile Money', ready: true },
  { id: 'ghana', name: 'Ghana', currency: 'GHS', paymentType: 'Mobile Money', ready: false },
  { id: 'rwanda', name: 'Rwanda', currency: 'RWF', paymentType: 'Mobile Money', ready: true },
  { id: 'kenya', name: 'Kenya', currency: 'KES', paymentType: 'M-Pesa', ready: false },
  { id: 'uganda', name: 'Uganda', currency: 'UGX', paymentType: 'Mobile Money', ready: false },
]

const USD_TO_NGN = 1450
const USD_TO_CFA = 600
const USD_TO_RWF = 1500

function Deposit() {
  const navigate = useNavigate()
  const { addDeposit } = useApp()
  const [amountUsd, setAmountUsd] = useState('')
  const [country, setCountry] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [platformBankAccounts, setPlatformBankAccounts] = useState([])
  const [selectedPaymentAccountId, setSelectedPaymentAccountId] = useState('')
  const [copiedField, setCopiedField] = useState('')

  const amount = parseFloat(amountUsd) || 0
  const nairaAmount = Math.round(amount * USD_TO_NGN)
  const cfaAmount = Math.round(amount * USD_TO_CFA)
  const rwfAmount = Math.round(amount * USD_TO_RWF)

  const countryConfig = COUNTRIES.find((c) => c.id === country)
  const isReady = !!countryConfig?.ready
  const selectedCurrency = country === 'nigeria' ? 'NGN' : country === 'cameroon' ? 'CFA' : country === 'rwanda' ? 'RWF' : ''
  const availablePaymentAccounts = useMemo(
    () => platformBankAccounts.filter((account) => account.currency === selectedCurrency),
    [platformBankAccounts, selectedCurrency],
  )
  const selectedPaymentAccount =
    availablePaymentAccounts.find((account) => account.id === selectedPaymentAccountId) ||
    availablePaymentAccounts[0] ||
    null

  const handleCopyField = async (label, value) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(label)
      setTimeout(() => setCopiedField(''), 2000)
    } catch {
      // ignore clipboard errors – copy is just a convenience
    }
  }

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

  const handleSubmitPayment = async () => {
    if (!isReady) return
    if (!fullName.trim()) return
    if (!selectedPaymentAccount) return
    if (amount <= 0) return
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      const id = await addDeposit({
        userId: 'current-user',
        amount: country === 'nigeria' ? nairaAmount : country === 'cameroon' ? cfaAmount : rwfAmount,
        amountUsd: amount,
        currency: country === 'nigeria' ? 'NGN' : country === 'cameroon' ? 'CFA' : 'RWF',
        country: countryConfig.name,
        paymentType: countryConfig.paymentType,
        accountNumber: selectedPaymentAccount.accountNumber || '',
        accountName: fullName.trim(),
        bankName: selectedPaymentAccount.bankName || '',
        accountUsed: selectedPaymentAccount.accountNumber || '',
        saveDetail: false,
      })
      if (id) {
        setSubmitted(true)
        setTimeout(() => navigate('/dashboard'), 2000)
      } else {
        setError('Could not submit deposit. Please try again.')
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deposit</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Add funds to your balance. After approval you can use the balance to activate Ads Engine.
        </p>
        <Link
          to="/dashboard/deposit-history"
          className="inline-block mt-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          View deposit history →
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Amount to deposit (USD)</h2>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amountUsd}
          onChange={(e) => setAmountUsd(e.target.value)}
          placeholder="0.00"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {[10, 20, 50, 100, 200].map((usd) => (
            <button
              key={usd}
              type="button"
              onClick={() => setAmountUsd(String(usd))}
              className="px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            >
              ${usd}
            </button>
          ))}
        </div>
      </div>

      {/* Country / currency selection (like Request Withdrawal) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select country / currency</h2>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
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
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Exchange rate</p>
            {country === 'nigeria' && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-4">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Nigeria — NGN (Naira)</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">1 USD = ₦{USD_TO_NGN.toLocaleString()}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  You&apos;ll deposit: ₦{nairaAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} - using the details below
                </p>
              </div>
            )}
            {country === 'cameroon' && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-4">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Cameroon — CFA</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">1 USD = CFA {USD_TO_CFA.toLocaleString()}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  You&apos;ll deposit: CFA {cfaAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} - using the details below
                </p>
              </div>
            )}
            {country === 'rwanda' && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-4">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Rwanda — RWF (Rwandan Franc)</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">1 USD = RWF {USD_TO_RWF.toLocaleString()}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  You&apos;ll deposit: RWF {rwfAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} - using the details below
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment details by country */}
      {isReady && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {country === 'nigeria' ? 'Bank account (Nigeria)' : country === 'cameroon' ? 'Mobile Money (Cameroon)' : 'Mobile Money (Rwanda)'}
          </h2>
          {availablePaymentAccounts.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Select payment account</label>
              <select
                value={selectedPaymentAccountId}
                onChange={(e) => setSelectedPaymentAccountId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
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
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-700 dark:text-amber-300">
              No payment account configured for {selectedCurrency}. Add one from Admin &gt; Add Bank Account.
            </div>
          )}
          {country === 'nigeria' && selectedPaymentAccount && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Account number</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-medium text-gray-900 dark:text-gray-200">
                    {selectedPaymentAccount.accountNumber || '-'}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyField('Account number', selectedPaymentAccount.accountNumber)}
                    className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Account name</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-gray-200">
                    {selectedPaymentAccount.accountName || '-'}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyField('Account name', selectedPaymentAccount.accountName)}
                    className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bank</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-gray-200">
                    {selectedPaymentAccount.bankName || '-'}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyField('Bank', selectedPaymentAccount.bankName)}
                    className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}
          {country === 'cameroon' && selectedPaymentAccount && (() => {
            const ussd = '*126*9*670476375#'
            return (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mobile Money number (USSD)</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {ussd ? (
                      <a
                        href={`tel:${ussd}`}
                        className="font-mono font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {ussd}
                      </a>
                    ) : (
                      <p className="font-mono font-medium text-gray-900 dark:text-gray-200">-</p>
                    )}
                    {ussd && (
                      <button
                        type="button"
                        onClick={() => handleCopyField('Mobile Money number', ussd)}
                        className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Account name</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {selectedPaymentAccount.accountName || '-'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyField('Account name', selectedPaymentAccount.accountName)}
                      className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mobile money network</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {selectedPaymentAccount.bankName || '-'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyField('Mobile money network', selectedPaymentAccount.bankName)}
                      className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}
          {country === 'rwanda' && selectedPaymentAccount && (() => {
            const ussd = '*182*1*1*0787710293#'
            return (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mobile Money number (USSD)</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {ussd ? (
                      <a
                        href={`tel:${ussd}`}
                        className="font-mono font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {ussd}
                      </a>
                    ) : (
                      <p className="font-mono font-medium text-gray-900 dark:text-gray-200">-</p>
                    )}
                    {ussd && (
                      <button
                        type="button"
                        onClick={() => handleCopyField('Mobile Money number', ussd)}
                        className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Account name</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {selectedPaymentAccount.accountName || '-'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyField('Account name', selectedPaymentAccount.accountName)}
                      className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mobile money network</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {selectedPaymentAccount.bankName || '-'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyField('Mobile money network', selectedPaymentAccount.bankName)}
                      className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}

          {copiedField && (
            <div className="mt-4 text-xs text-green-600 dark:text-green-400">
              {copiedField} copied to clipboard
            </div>
          )}

        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Name on the account / mobile money you are paying from
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Enter the exact name that appears on the bank account or mobile money you used for this payment.
        </p>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Account or mobile money name"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
        />
      </div>

      {error && (
        <p className="text-center text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}

      {submitted ? (
        <p className="text-center text-green-600 dark:text-green-400 font-medium">
          Payment submitted. Waiting for admin confirmation. Redirecting...
        </p>
      ) : (
        <div className="flex gap-3">
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button
            onClick={handleSubmitPayment}
            disabled={!isReady || !fullName.trim() || !selectedPaymentAccount || amount <= 0 || submitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'I have made the payment'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Deposit

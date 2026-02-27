import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const COUNTRIES = [
  { id: 'nigeria', name: 'Nigeria', currency: 'NGN', paymentType: 'Bank Account', ready: true },
  { id: 'cameroon', name: 'Cameroon', currency: 'CFA', paymentType: 'Mobile Money', ready: true },
  { id: 'ghana', name: 'Ghana', currency: 'GHS', paymentType: 'Mobile Money', ready: false },
  { id: 'rwanda', name: 'Rwanda', currency: 'RWF', paymentType: 'Mobile Money', ready: false },
  { id: 'kenya', name: 'Kenya', currency: 'KES', paymentType: 'M-Pesa', ready: false },
  { id: 'uganda', name: 'Uganda', currency: 'UGX', paymentType: 'Mobile Money', ready: false },
]

function Deposit() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addDeposit, PACKS_USD } = useApp()
  const initialPackUsd = location.state?.pack
  const [selectedPackUsd, setSelectedPackUsd] = useState(
    PACKS_USD.some((p) => p.usd === initialPackUsd) ? initialPackUsd : PACKS_USD[0].usd,
  )
  const packInfo = PACKS_USD.find((p) => p.usd === selectedPackUsd) || PACKS_USD[0]
  const [country, setCountry] = useState('nigeria')
  const [fullName, setFullName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [platformBankAccounts, setPlatformBankAccounts] = useState(() => {
    if (typeof window === 'undefined' || !window.localStorage) return []
    try {
      const raw = window.localStorage.getItem('platformBankAccounts')
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [selectedPaymentAccountId, setSelectedPaymentAccountId] = useState('')

  const nairaAmount = packInfo.naira
  const cfaAmount = packInfo.cfa

  const countryConfig = COUNTRIES.find((c) => c.id === country)
  const isReady = countryConfig?.ready
  const selectedCurrency = country === 'nigeria' ? 'NGN' : 'CFA'
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
    if (typeof window === 'undefined') return undefined
    const syncAccounts = () => {
      try {
        const raw = window.localStorage.getItem('platformBankAccounts')
        const parsed = raw ? JSON.parse(raw) : []
        setPlatformBankAccounts(Array.isArray(parsed) ? parsed : [])
      } catch {
        setPlatformBankAccounts([])
      }
    }
    window.addEventListener('storage', syncAccounts)
    return () => window.removeEventListener('storage', syncAccounts)
  }, [])

  const handleSubmitPayment = () => {
    if (!isReady) return
    if (!fullName.trim()) return
    if (!selectedPaymentAccount) return
    addDeposit({
      userId: 'current-user',
      amount: country === 'nigeria' ? nairaAmount : cfaAmount,
      currency: country === 'nigeria' ? 'NGN' : 'CFA',
      country: countryConfig.name,
      paymentType: countryConfig.paymentType,
      accountNumber: selectedPaymentAccount.accountNumber || '',
      accountName: fullName.trim(),
      bankName: selectedPaymentAccount.bankName || '',
      accountUsed: selectedPaymentAccount.accountNumber || '',
      saveDetail: false,
      pack: selectedPackUsd,
    })
    setSubmitted(true)
    setTimeout(() => navigate('/dashboard'), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deposit</h1>
        <p className="text-gray-600 mt-1">
          Select your country, submit payment, and reuse saved account details next time.
        </p>
      </div>

      {/* Amount in each country (equivalent) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Ads Engine package</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PACKS_USD.map((pack) => (
            <button
              key={pack.usd}
              onClick={() => setSelectedPackUsd(pack.usd)}
              className={`p-4 rounded-lg border-2 text-left ${
                selectedPackUsd === pack.usd ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
              }`}
            >
              <p className="font-semibold text-gray-900">{pack.planName}</p>
              <p className="text-sm text-gray-700 mt-1">${pack.usd} USD</p>
              <p className="text-xs text-gray-500 mt-1">{pack.adsPerDay} ads/day</p>
            </button>
          ))}
        </div>
      </div>

      {/* Amount in each country (equivalent) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Amount to pay (equivalent)</h2>
        <div className="p-4 bg-primary-50 rounded-lg">
          <p className="text-sm text-gray-500">Package</p>
          <p className="text-2xl font-bold text-gray-900">${selectedPackUsd} USD</p>
        </div>
      </div>

      {/* Country selection */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select country</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {COUNTRIES.map((c) => {
            const amountLine = c.id === 'nigeria' ? `₦${nairaAmount.toLocaleString()}` : c.id === 'cameroon' ? `CFA ${cfaAmount.toLocaleString()}` : null
            return (
              <button
                key={c.id}
                onClick={() => setCountry(c.id)}
                disabled={!c.ready}
                className={`p-4 rounded-lg border-2 text-left ${
                  country === c.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
                } ${!c.ready ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <p className="font-medium text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-500">{c.currency} · {c.paymentType}</p>
                {amountLine && <p className="text-sm font-semibold text-gray-900 mt-1">{amountLine}</p>}
                {!c.ready && <span className="text-xs text-amber-600">Coming soon</span>}
              </button>
            )
          })}
        </div>
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
            disabled={!isReady || !fullName.trim() || !selectedPaymentAccount}
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

import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'

function Withdrawal() {
  const { saveWithdrawalDetail, savedWithdrawalDetails, withdrawals } = useApp()
  const [currency, setCurrency] = useState('NGN')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const savedWithdrawalDetail = savedWithdrawalDetails[0] || null

  useEffect(() => {
    if (!savedWithdrawalDetail) return
    setCurrency(savedWithdrawalDetail.currency || 'NGN')
    setAccountName(savedWithdrawalDetail.accountName || '')
    setAccountNumber(savedWithdrawalDetail.accountNumber || '')
    setBankName(savedWithdrawalDetail.bankName || '')
  }, [savedWithdrawalDetail])

  const handleSave = async () => {
    if (!accountName.trim() || !accountNumber.trim() || !bankName.trim()) return
    setSaveError('')
    setSaving(true)
    const id = await saveWithdrawalDetail({
      currency,
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      bankName: bankName.trim(),
    })
    setSaving(false)
    if (id != null) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setSaveError('Could not save withdrawal details. Try again.')
    }
  }

  const showForm = !savedWithdrawalDetail

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Withdrawal Details</h1>
        <p className="text-gray-600 mt-1">
          {savedWithdrawalDetail
            ? 'Your saved payout account for withdrawals. Details cannot be changed once saved.'
            : 'Add your withdrawal details once for future payouts. This cannot be edited later.'}
        </p>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add withdrawal details</h2>
          <div className="space-y-4">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {currency === 'NGN' ? 'Account number' : 'Mobile money number'}
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={currency === 'NGN' ? 'Your account number' : 'Your mobile money number'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {currency === 'NGN' ? 'Account name' : 'Mobile money name'}
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder={currency === 'NGN' ? 'Your account name' : 'Your mobile money name'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {currency === 'NGN' ? 'Bank name' : 'Mobile money network'}
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder={currency === 'NGN' ? 'Your bank name' : 'Your mobile money network'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleSave}
              disabled={saving || !accountName.trim() || !accountNumber.trim() || !bankName.trim()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save details'}
            </button>
          </div>
          {saveError && <p className="text-red-600 text-sm mt-2">{saveError}</p>}
          {saved && (
            <p className="text-green-600 font-medium mt-3">
              Withdrawal details saved successfully. They cannot be changed later.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Saved withdrawal account</h2>
          <div className="space-y-2">
            <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
              <p><span className="font-medium">Currency:</span> {savedWithdrawalDetail.currency}</p>
              <p><span className="font-medium">Name:</span> {savedWithdrawalDetail.accountName || '-'}</p>
              <p><span className="font-medium">Number:</span> {savedWithdrawalDetail.accountNumber}</p>
              {savedWithdrawalDetail.bankName && <p><span className="font-medium">Bank:</span> {savedWithdrawalDetail.bankName}</p>}
            </div>
          </div>
        </div>
      )}

      {withdrawals.filter((w) => w.userId === 'current-user').length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Your withdrawal history</h2>
          <div className="space-y-2">
            {withdrawals
              .filter((w) => w.userId === 'current-user')
              .slice(0, 6)
              .map((w) => (
                <div key={w.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{w.currency} withdrawal</p>
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
        </div>
      )}
    </div>
  )
}

export default Withdrawal

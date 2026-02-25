import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const LEVELS = [
  { level: 1, rate: 10, desc: 'People you referred directly' },
  { level: 2, rate: 2, desc: 'People referred by your Level 1' },
  { level: 3, rate: 1, desc: 'People referred by your Level 2' },
]

const NGN_TO_USD = 1 / 1450

function Referral() {
  const [copied, setCopied] = useState(false)
  const { referralEarnings, referralCount, currentUser } = useApp()
  const code = currentUser?.myInvitationCode || 'N/A'
  const referralLink = `https://advanplux.com/sign-up?invite=${code}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalEarnings = referralEarnings.level1 + referralEarnings.level2 + referralEarnings.level3
  const formatAmount = (amountNgn) => `$${(amountNgn * NGN_TO_USD).toFixed(2)}`

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referral / Affiliate</h1>
        <p className="text-gray-600 mt-1">
          Earn 10% Level 1, 2% Level 2, 1% Level 3. Share your link and see earnings on your dashboard.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your referral link</h2>
        <p className="text-sm text-gray-600 mb-2">Your invitation code: <span className="font-semibold text-primary-700">{code}</span></p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
          />
          <button
            onClick={handleCopy}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 whitespace-nowrap"
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total referral earnings</p>
          <p className="text-2xl font-bold text-primary-600">{formatAmount(totalEarnings)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total referrals</p>
          <p className="text-2xl font-bold text-gray-900">
            L1: {referralCount.level1} · L2: {referralCount.level2} · L3: {referralCount.level3}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Referral levels & earnings</h2>
        <div className="space-y-4">
          {LEVELS.map((l) => (
            <div key={l.level} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Level {l.level} — {l.rate}%</p>
                <p className="text-sm text-gray-500">{l.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Earnings</p>
                <p className="font-bold text-primary-600">
                  {formatAmount(referralEarnings[`level${l.level}`] || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Referral

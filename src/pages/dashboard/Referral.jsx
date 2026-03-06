import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

const LEVELS = [
  { level: 1, rate: 10, desc: 'People you referred directly' },
  { level: 2, rate: 2, desc: 'People referred by your Level 1' },
  { level: 3, rate: 1, desc: 'People referred by your Level 2' },
]

function Referral() {
  const [copied, setCopied] = useState(false)
  const [referralList, setReferralList] = useState({ level1: [], level2: [], level3: [] })
  const [referralListLoading, setReferralListLoading] = useState(true)
  const { referralEarnings, referralCount, currentUser } = useApp()
  const code = currentUser?.myInvitationCode || currentUser?.invitationCode || 'N/A'
  const referralLink = `https://advanplux.com/sign-up?invite=${code}`

  useEffect(() => {
    const token = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('authSessionToken') : null
    if (!token || !currentUser) {
      setReferralListLoading(false)
      return
    }
    setReferralListLoading(true)
    fetch('/api/user/referral-list', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && d.level1) setReferralList({ level1: d.level1 || [], level2: d.level2 || [], level3: d.level3 || [] })
      })
      .catch(() => setReferralList({ level1: [], level2: [], level3: [] }))
      .finally(() => setReferralListLoading(false))
  }, [currentUser])

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalEarningsUsd = Number(referralEarnings.level1 || 0) + Number(referralEarnings.level2 || 0) + Number(referralEarnings.level3 || 0)
  const formatUsd = (usd) => `$${Number(usd || 0).toFixed(2)}`

  const LevelMembers = ({ level, members, desc }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-base font-semibold text-gray-900">Level {level} — {desc}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="overflow-x-auto">
        {members.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No one on this level yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3 text-gray-600 font-medium">#</th>
                <th className="p-3 text-gray-600 font-medium">Account ID</th>
                <th className="p-3 text-gray-600 font-medium">Email</th>
                <th className="p-3 text-gray-600 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.id} className="border-t border-gray-100">
                  <td className="p-3 text-gray-500">{i + 1}</td>
                  <td className="p-3 font-mono text-gray-900">{m.invitationCode || '–'}</td>
                  <td className="p-3 text-gray-900 break-all">{m.email || '–'}</td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">{m.joinedAt ? new Date(m.joinedAt).toLocaleString() : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referral / Affiliate</h1>
        <p className="text-gray-600 mt-1">
          Earn 10% Level 1, 2% Level 2, 1% Level 3. Share your link and see earnings on your dashboard.
        </p>
        {currentUser && (
          <p className="text-xs text-gray-500 mt-1">
            Your account ID: <span className="font-mono">{currentUser.myInvitationCode || currentUser.invitationCode || '–'}</span>
          </p>
        )}
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
          <p className="text-2xl font-bold text-primary-600">{formatUsd(totalEarningsUsd)}</p>
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
                  {formatUsd(referralEarnings[`level${l.level}`] || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Members under you (by level)</h2>
        <p className="text-sm text-gray-600 mb-4">People who registered using your affiliate link or invitation code, and their downlines.</p>
        {referralListLoading ? (
          <p className="text-gray-500 py-4">Loading…</p>
        ) : (
          <div className="space-y-6">
            <LevelMembers level={1} members={referralList.level1} desc="People you referred directly" />
            <LevelMembers level={2} members={referralList.level2} desc="People referred by your Level 1" />
            <LevelMembers level={3} members={referralList.level3} desc="People referred by your Level 2" />
          </div>
        )}
      </div>
    </div>
  )
}

export default Referral

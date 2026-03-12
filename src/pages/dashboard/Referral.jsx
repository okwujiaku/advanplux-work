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
  const [expandedLevel, setExpandedLevel] = useState(null)
  const { referralEarnings, teamCommissionEarnings, referralCount, currentUser } = useApp()
  const code = currentUser?.myInvitationCode || currentUser?.invitationCode || 'N/A'
  const referralLink = `https://advanplux.com/sign-up?invite=${code}`

  useEffect(() => {
    const token =
      typeof window !== 'undefined' && window.sessionStorage
        ? window.sessionStorage.getItem('authSessionToken')
        : null
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral / Affiliate</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Earn 10% Level 1, 2% Level 2, 1% Level 3. Share your link and see earnings on your dashboard.
        </p>
        {currentUser && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Your account ID: <span className="font-mono">{currentUser.myInvitationCode || currentUser.invitationCode || '–'}</span>
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your referral link</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your invitation code: <span className="font-semibold text-primary-600 dark:text-primary-400">{code}</span></p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200"
          />
          <button
            onClick={handleCopy}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 whitespace-nowrap"
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total referral earnings</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatUsd(totalEarningsUsd)}</p>
          <p className="text-xs text-gray-400 mt-0.5">From Ads Engine purchase</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total team commission earning</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatUsd(teamCommissionEarnings)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total referrals</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            L1: {referralCount.level1} · L2: {referralCount.level2} · L3: {referralCount.level3}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Referral levels & earnings</h2>
        <div className="space-y-4">
          {LEVELS.map((l) => {
            const members = referralList[`level${l.level}`] || []
            const isExpanded = expandedLevel === l.level
            return (
              <div key={l.level} className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Level {l.level} — {l.rate}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{l.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-right">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Earnings </span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">{formatUsd(referralEarnings[`level${l.level}`] || 0)}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setExpandedLevel(isExpanded ? null : l.level)}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg border border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 whitespace-nowrap"
                    >
                      {isExpanded ? 'Hide members' : `View Level ${l.level}`}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600 overflow-x-auto">
                    {referralListLoading ? (
                      <p className="text-gray-500 dark:text-gray-400 py-2 text-sm">Loading…</p>
                    ) : members.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No one on this level yet.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-600/50 text-left">
                            <th className="p-2 text-gray-600 dark:text-gray-300 font-medium">#</th>
                            <th className="p-2 text-gray-600 dark:text-gray-300 font-medium">Account ID</th>
                            <th className="p-2 text-gray-600 dark:text-gray-300 font-medium">Email</th>
                            <th className="p-2 text-gray-600 dark:text-gray-300 font-medium">Joined</th>
                            <th className="p-2 text-gray-600 dark:text-gray-300 font-medium">From referral</th>
                            <th className="p-2 text-gray-600 dark:text-gray-300 font-medium">From team commission</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((m, i) => (
                            <tr key={m.id} className="border-t border-gray-100 dark:border-gray-600">
                              <td className="p-2 text-gray-500 dark:text-gray-400">{i + 1}</td>
                              <td className="p-2 font-mono text-gray-900 dark:text-gray-200">{m.invitationCode || '–'}</td>
                              <td className="p-2 text-gray-900 dark:text-gray-200 break-all">{m.email || '–'}</td>
                              <td className="p-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">{m.joinedAt ? new Date(m.joinedAt).toLocaleString() : '–'}</td>
                              <td className="p-2 text-primary-600 dark:text-primary-400 font-medium">{formatUsd(m.referralEarningsUsd)}</td>
                              <td className="p-2 text-primary-600 dark:text-primary-400 font-medium">{formatUsd(m.teamCommissionUsd)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Click “View Level N” to see the list of members on that level.</p>
      </div>
    </div>
  )
}

export default Referral

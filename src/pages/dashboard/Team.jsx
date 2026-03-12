import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'

const SALARY_TIERS = [
  { investors: 10, salary: 2, label: '10 direct active downlines' },
  { investors: 25, salary: 6, label: '25 direct active downlines' },
  { investors: 50, salary: 15, label: '50 direct active downlines' },
  { investors: 100, salary: 40, label: '100 direct active downlines' },
  { investors: 200, salary: 100, label: '200 direct active downlines' },
  { investors: 500, salary: 300, label: '500 direct active downlines' },
  { investors: 1000, salary: 700, label: '1000 direct active downlines' },
]
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000

function Team() {
  const { referralCount, claimSalary, claimedSalary, earningsHistory, currentUser, refetchWalletAndDeposits } = useApp()
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState(null)

  useEffect(() => {
    refetchWalletAndDeposits()
  }, [refetchWalletAndDeposits])

  const directDownlinesL1 = referralCount.level1 || 0
  const directActiveDownlines = referralCount.directActiveDownlines ?? directDownlinesL1
  const totalTeam = (referralCount.level1 || 0) + (referralCount.level2 || 0) + (referralCount.level3 || 0)
  const currentTier = SALARY_TIERS.filter((t) => directActiveDownlines >= t.investors).pop()
  const nextTier = SALARY_TIERS.find((t) => t.investors > directActiveDownlines)

  const lastClaimTime = useMemo(() => {
    const teamSalaryEntries = (earningsHistory || []).filter((e) => e && e.source === 'team-salary' && e.date)
    if (teamSalaryEntries.length === 0) return null
    const dates = teamSalaryEntries.map((e) => new Date(e.date).getTime())
    return Math.max(...dates)
  }, [earningsHistory])
  const canClaimAgainAt = lastClaimTime ? lastClaimTime + COOLDOWN_MS : null
  const now = Date.now()
  const claimCooldownActive = canClaimAgainAt != null && now < canClaimAgainAt
  const nextClaimInMs = claimCooldownActive ? canClaimAgainAt - now : 0

  const handleClaim = () => {
    if (claiming || claimCooldownActive || !currentTier) return
    setClaimError(null)
    setClaiming(true)
    claimSalary()
      .then((d) => {
        if (d?.ok) return
        setClaimError(d?.error || 'Claim failed.')
      })
      .finally(() => setClaiming(false))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Salary</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Weekly salary is based on direct downlines who have invested (bought an Ads Engine pack). Claim once every 7 days.
        </p>
        {currentUser && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Your account ID: <span className="font-mono">{currentUser.myInvitationCode || currentUser.invitationCode || '–'}</span>
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Direct active downlines (L1 who invested)</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{directActiveDownlines}</p>
          {directDownlinesL1 !== directActiveDownlines && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">L1 total: {directDownlinesL1} (salary counts only those who invested)</p>
          )}
          {totalTeam > directDownlinesL1 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total team (L1+L2+L3): {totalTeam}</p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Next tier target</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {nextTier ? `${nextTier.investors - directActiveDownlines} more direct active downline(s)` : 'Top tier reached'}
          </p>
        </div>
      </div>

      {/* Salary tiers */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team salary (weekly)</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          When your direct downlines who have invested reach the counts below, you get a weekly salary. You can claim once every 7 days.
        </p>
        <div className="space-y-3">
          {SALARY_TIERS.map((t) => {
            const reached = directActiveDownlines >= t.investors
            return (
              <div
                key={t.investors}
                className={`flex justify-between items-center p-4 rounded-lg border ${reached ? 'border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600'}`}
              >
                <span className="font-medium text-gray-900 dark:text-gray-200">{t.label}</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">${t.salary.toLocaleString()}/weekly</span>
                {reached && <span className="text-xs text-green-600 dark:text-green-400">✓ Reached</span>}
              </div>
            )
          })}
        </div>
        {currentTier && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              You can claim <strong>${currentTier.salary.toLocaleString()}</strong> this week (once every 7 days).
            </p>
            <button
              onClick={handleClaim}
              disabled={claiming || claimCooldownActive}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {claiming ? 'Claiming…' : claimCooldownActive ? `Next claim in ${Math.ceil(nextClaimInMs / (24 * 60 * 60 * 1000))} day(s)` : 'Claim salary'}
            </button>
            {claimError && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{claimError}</p>}
          </div>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Claimed so far: ${Number(claimedSalary || 0).toLocaleString()}</p>
      </div>

    </div>
  )
}

export default Team

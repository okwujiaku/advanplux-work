import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'

const SOURCE_LABELS = {
  'watch-ads': 'Watch Ads',
  'referral-level1': 'Referral (10% L1)',
  'referral-level2': 'Referral (2% L2)',
  'referral-level3': 'Referral (1% L3)',
  'team-watch-level1': 'Team commission (10% L1 watch ads)',
  'team-watch-level2': 'Team commission (2% L2 watch ads)',
  'team-watch-level3': 'Team commission (1% L3 watch ads)',
  'team-salary': 'Team',
}

function formatUsd(amount) {
  return `$${Number(amount || 0).toFixed(2)}`
}

function EarningHistory() {
  const { earningsHistory, referralEarnings, claimedSalary, teamCommissionEarnings } = useApp()

  const sourceTotals = useMemo(() => {
    const totalFromAds = (earningsHistory || [])
      .filter((e) => e && e.source === 'watch-ads')
      .reduce((sum, e) => sum + (Number(e.amountUsd) || 0), 0)
    const referralTotalUsd = Number(referralEarnings.level1 || 0) + Number(referralEarnings.level2 || 0) + Number(referralEarnings.level3 || 0)
    const teamSalary = Number(claimedSalary || 0)
    const teamCommission = Number(teamCommissionEarnings || 0)
    return {
      watchAds: Number(totalFromAds.toFixed(2)),
      referral: Number(referralTotalUsd.toFixed(2)),
      team: Number((teamSalary + teamCommission).toFixed(2)),
    }
  }, [earningsHistory, claimedSalary, referralEarnings, teamCommissionEarnings])

  const records = (earningsHistory || []).slice(0, 100)

  return (
    <div className="w-full min-w-0 max-w-4xl mx-auto px-3 sm:px-4 space-y-5 sm:space-y-6 pb-28 md:pb-0">
      <div className="pt-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Earning History</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Track your earnings by source: watch ads, referral, and Team.</p>
      </div>

      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Earnings by source</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-3 flex flex-col">
            <p className="text-xs text-gray-500 dark:text-gray-400">Watch ads (total from ads)</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">{formatUsd(sourceTotals.watchAds)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-3 flex flex-col">
            <p className="text-xs text-gray-500 dark:text-gray-400">Referral</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">{formatUsd(sourceTotals.referral)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-3 flex flex-col">
            <p className="text-xs text-gray-500 dark:text-gray-400">Team</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">{formatUsd(sourceTotals.team)}</p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">Recent earning records</h2>

        {/* Mobile: card list */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {records.length === 0 ? (
            <p className="p-4 text-gray-500 dark:text-gray-400 text-sm">No earning history yet.</p>
          ) : (
            records.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col gap-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.date ? new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </span>
                  <span className="font-semibold text-green-700 dark:text-green-400 text-sm shrink-0">{formatUsd(entry.amountUsd)}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{SOURCE_LABELS[entry.source] || entry.source || '-'}</p>
                {entry.note && entry.note !== '-' && <p className="text-xs text-gray-600 dark:text-gray-400">{entry.note}</p>}
              </div>
            ))
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-left">
                <th className="p-3 text-gray-900 dark:text-gray-200">Date</th>
                <th className="p-3 text-gray-900 dark:text-gray-200">Source</th>
                <th className="p-3 text-gray-900 dark:text-gray-200">Amount</th>
                <th className="p-3 text-gray-900 dark:text-gray-200">Note</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-500 dark:text-gray-400" colSpan={4}>No earning history yet.</td>
                </tr>
              ) : (
                records.map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-3 text-gray-900 dark:text-gray-200">{entry.date ? new Date(entry.date).toLocaleString() : '-'}</td>
                    <td className="p-3 text-gray-900 dark:text-gray-200">{SOURCE_LABELS[entry.source] || entry.source || '-'}</td>
                    <td className="p-3 font-semibold text-green-700 dark:text-green-400">{formatUsd(entry.amountUsd)}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{entry.note || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default EarningHistory

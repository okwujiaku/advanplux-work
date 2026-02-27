import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'

const NGN_TO_USD = 1 / 1450

const SOURCE_LABELS = {
  'watch-ads': 'Watch Ads',
  'referral-total': 'Referral',
  'team-salary': 'Team',
  bonus: 'Bonus',
}

function formatUsd(amount) {
  return `$${Number(amount || 0).toFixed(2)}`
}

function EarningHistory() {
  const { earningsHistory, adsViewedToday, referralEarnings, claimedSalary } = useApp()

  const sourceTotals = useMemo(() => {
    const referralTotalNgn = Number(referralEarnings.level1 || 0) + Number(referralEarnings.level2 || 0) + Number(referralEarnings.level3 || 0)
    return {
      watchAds: Number((adsViewedToday * 0.4).toFixed(2)),
      referral: Number((referralTotalNgn * NGN_TO_USD).toFixed(2)),
      team: Number(claimedSalary || 0),
      bonus: 0,
    }
  }, [adsViewedToday, claimedSalary, referralEarnings])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earning History</h1>
        <p className="text-gray-600 mt-1">Track your earnings by source: watch ads, referral, team, and bonus.</p>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Earnings by source</h2>
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Watch ads</p>
            <p className="text-lg font-semibold text-gray-900">{formatUsd(sourceTotals.watchAds)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Referral</p>
            <p className="text-lg font-semibold text-gray-900">{formatUsd(sourceTotals.referral)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Team</p>
            <p className="text-lg font-semibold text-gray-900">{formatUsd(sourceTotals.team)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Bonus</p>
            <p className="text-lg font-semibold text-gray-900">{formatUsd(sourceTotals.bonus)}</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Recent earning records</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">Date</th>
                <th className="p-3">Source</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {earningsHistory.length === 0 ? (
                <tr className="border-t">
                  <td className="p-4 text-gray-500" colSpan={4}>No earning history yet.</td>
                </tr>
              ) : (
                earningsHistory.slice(0, 100).map((entry) => (
                  <tr key={entry.id} className="border-t">
                    <td className="p-3">{entry.date ? new Date(entry.date).toLocaleString() : '-'}</td>
                    <td className="p-3">{SOURCE_LABELS[entry.source] || entry.source || '-'}</td>
                    <td className="p-3 font-semibold text-green-700">{formatUsd(entry.amountUsd)}</td>
                    <td className="p-3 text-gray-600">{entry.note || '-'}</td>
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

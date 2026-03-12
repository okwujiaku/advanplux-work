import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'

function StatusBadge({ status }) {
  const classes =
    status === 'approved'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : status === 'rejected'
        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        : status === 'reversed'
          ? 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  return (
    <span className={`inline-flex items-center justify-center text-xs px-2 py-1 rounded-full ${classes}`}>
      {status}
    </span>
  )
}

function DepositHistory() {
  const { deposits, currentUserId } = useApp()
  const myDeposits = useMemo(
    () =>
      deposits.filter(
        (deposit) =>
          deposit.userId === currentUserId || deposit.userId === 'current-user',
      ),
    [deposits, currentUserId],
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deposit History</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">See all your deposit submissions, including pending and approved status.</p>
      </div>

      {/* Mobile: card list (fits viewport, no zoom) */}
      <section className="md:hidden space-y-3">
        {myDeposits.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-gray-500 dark:text-gray-400 text-center text-sm">
            No deposits yet.
          </div>
        ) : (
          myDeposits.map((deposit) => (
            <div
              key={deposit.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-2 text-sm"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-500 dark:text-gray-400">Date</span>
                <span className="text-gray-900 dark:text-gray-100 text-right">{deposit.date ? new Date(deposit.date).toLocaleString() : '-'}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Amount (USD)</span>
                <span className="font-semibold text-gray-900 dark:text-white">${Number(deposit.amountUsd || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Amount (Local)</span>
                <span className="text-gray-900 dark:text-gray-100">{deposit.currency} {Number(deposit.amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Country</span>
                <span className="text-gray-900 dark:text-gray-100">{deposit.country || '-'}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Method</span>
                <span className="text-gray-900 dark:text-gray-100">{deposit.paymentType || '-'}</span>
              </div>
              <div className="flex justify-between items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <StatusBadge status={deposit.status} />
              </div>
            </div>
          ))
        )}
      </section>

      {/* Desktop: table */}
      <section className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-left">
                <th className="p-3 w-40">Date</th>
                <th className="p-3 w-28">Amount (USD)</th>
                <th className="p-3 w-32">Amount (Local)</th>
                <th className="p-3 w-28">Country</th>
                <th className="p-3 w-32">Method</th>
                <th className="p-3 w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {myDeposits.length === 0 ? (
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-500 dark:text-gray-400" colSpan={6}>No deposits yet.</td>
                </tr>
              ) : (
                myDeposits.map((deposit) => (
                  <tr key={deposit.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-3 whitespace-nowrap align-top text-gray-900 dark:text-gray-100">{deposit.date ? new Date(deposit.date).toLocaleString() : '-'}</td>
                    <td className="p-3 whitespace-nowrap align-top text-gray-900 dark:text-gray-100">${Number(deposit.amountUsd || 0).toFixed(2)}</td>
                    <td className="p-3 whitespace-nowrap align-top text-gray-900 dark:text-gray-100">{deposit.currency} {Number(deposit.amount || 0).toLocaleString()}</td>
                    <td className="p-3 whitespace-nowrap align-top text-gray-900 dark:text-gray-100">{deposit.country || '-'}</td>
                    <td className="p-3 whitespace-nowrap align-top text-gray-900 dark:text-gray-100">{deposit.paymentType || '-'}</td>
                    <td className="p-3 align-top">
                      <StatusBadge status={deposit.status} />
                    </td>
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

export default DepositHistory

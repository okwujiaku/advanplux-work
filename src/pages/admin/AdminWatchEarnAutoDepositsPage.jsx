import { Link, useOutletContext } from 'react-router-dom'
import { getUserDisplay } from './memberDisplay'

function isWatchEarnAutoDeposit(d) {
  return d && (d.pack === 'watch_earn_auto' || d.paymentType === 'watch_earn_auto')
}

function AdminWatchEarnAutoDepositsPage() {
  const { deposits, approveDeposit, rejectDeposit, members } = useOutletContext()
  const getUserLabel = (userId) => getUserDisplay(userId, members)
  const pendingList = deposits.filter((d) => d.status === 'pending' && isWatchEarnAutoDeposit(d))

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
        Watch Earn Auto — pending payments ({pendingList.length})
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 px-4 pb-2 pt-2">
        $10 add-on: approving unlocks <strong className="text-gray-800 dark:text-gray-200">Run Auto Task</strong> for that member (no wallet credit).
        Users should mark purpose <span className="font-mono">Watch Earn Auto</span> on the transfer.{' '}
        <Link to="/admin/deposits" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
          All pending deposits
        </Link>
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-left">
              <th className="p-3">Date</th>
              <th className="p-3">User</th>
              <th className="p-3">Account / Mobile money name</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Currency</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingList.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-gray-500 dark:text-gray-400">
                  No pending Watch Earn Auto payments.
                </td>
              </tr>
            ) : (
              pendingList.map((d) => (
                <tr key={d.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-3 text-gray-900 dark:text-gray-100">{new Date(d.date).toLocaleString()}</td>
                  <td className="p-3 text-gray-900 dark:text-gray-100">{getUserLabel(d.userId)}</td>
                  <td className="p-3 text-gray-900 dark:text-gray-100">{d.accountName || '-'}</td>
                  <td className="p-3 text-gray-900 dark:text-gray-100">{d.amount?.toLocaleString?.() ?? d.amount}</td>
                  <td className="p-3 text-gray-900 dark:text-gray-100">{d.currency}</td>
                  <td className="p-3 text-gray-900 dark:text-gray-100">{d.status}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => approveDeposit(d.id)}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectDeposit(d.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminWatchEarnAutoDepositsPage

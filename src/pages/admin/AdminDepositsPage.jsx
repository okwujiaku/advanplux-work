import { useOutletContext } from 'react-router-dom'
import { getUserDisplay } from './memberDisplay'

function AdminDepositsPage() {
  const { deposits, approveDeposit, rejectDeposit, members } = useOutletContext()
  const getUserLabel = (userId) => getUserDisplay(userId, members)
  const pendingDeposits = deposits.filter((d) => d.status === 'pending')
  const pendingPaymentDeposits = pendingDeposits.filter((d) => d.paymentType !== 'balance_activation')

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">
          Confirm pending deposits ({pendingPaymentDeposits.length})
        </h2>
        <p className="text-sm text-gray-600 px-4 pb-2">
          Regular payment deposits. Approved or rejected records are in Deposit History.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">Date</th>
                <th className="p-3">User</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Account / Mobile money name</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Currency</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingPaymentDeposits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-gray-500">No pending payment deposits.</td>
                </tr>
              ) : (
                pendingPaymentDeposits.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="p-3">{new Date(d.date).toLocaleString()}</td>
                    <td className="p-3">{getUserLabel(d.userId)}</td>
                    <td className="p-3">
                      {d.pack === 'watch_earn_auto' || d.paymentType === 'watch_earn_auto'
                        ? 'Watch Earn Auto ($10)'
                        : 'Wallet deposit'}
                    </td>
                    <td className="p-3">{d.accountName || '-'}</td>
                    <td className="p-3">{d.amount?.toLocaleString()}</td>
                    <td className="p-3">{d.currency}</td>
                    <td className="p-3">{d.status}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => approveDeposit(d.id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Confirm</button>
                        <button onClick={() => rejectDeposit(d.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
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

export default AdminDepositsPage

import { useOutletContext } from 'react-router-dom'
import { getUserDisplay } from './memberDisplay'

function AdminHighTierActivationsPage() {
  const { deposits, approveDeposit, rejectDeposit, members } = useOutletContext()
  const getUserLabel = (userId) => getUserDisplay(userId, members)
  const pendingActivationRequests = deposits.filter(
    (d) => d.status === 'pending' && d.paymentType === 'balance_activation',
  )

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">
        High-tier activation requests ({pendingActivationRequests.length})
      </h2>
      <p className="text-sm text-gray-600 px-4 pb-2">
        These are wallet activations for $500/$1000 packs that require admin approval before watch access is enabled.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3">Date</th>
              <th className="p-3">User</th>
              <th className="p-3">Pack</th>
              <th className="p-3">Source</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingActivationRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-gray-500">No pending high-tier activation requests.</td>
              </tr>
            ) : (
              pendingActivationRequests.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-3">{new Date(d.date).toLocaleString()}</td>
                  <td className="p-3">{getUserLabel(d.userId)}</td>
                  <td className="p-3 font-medium">${Number(d.pack || d.amountUsd || 0).toFixed(2)}</td>
                  <td className="p-3">Wallet balance activation</td>
                  <td className="p-3">{d.status}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => approveDeposit(d.id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
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

export default AdminHighTierActivationsPage


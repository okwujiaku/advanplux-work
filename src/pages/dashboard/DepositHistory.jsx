import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'

function DepositHistory() {
  const { deposits } = useApp()
  const myDeposits = useMemo(
    () => deposits.filter((deposit) => deposit.userId === 'current-user'),
    [deposits],
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deposit History</h1>
        <p className="text-gray-600 mt-1">See all your deposit submissions, including pending and approved status.</p>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">Date</th>
                <th className="p-3">Amount (USD)</th>
                <th className="p-3">Amount (Local)</th>
                <th className="p-3">Country</th>
                <th className="p-3">Method</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {myDeposits.length === 0 ? (
                <tr className="border-t">
                  <td className="p-4 text-gray-500" colSpan={6}>No deposits yet.</td>
                </tr>
              ) : (
                myDeposits.map((deposit) => (
                  <tr key={deposit.id} className="border-t">
                    <td className="p-3">{deposit.date ? new Date(deposit.date).toLocaleString() : '-'}</td>
                    <td className="p-3">${Number(deposit.amountUsd || 0).toFixed(2)}</td>
                    <td className="p-3">{deposit.currency} {Number(deposit.amount || 0).toLocaleString()}</td>
                    <td className="p-3">{deposit.country || '-'}</td>
                    <td className="p-3">{deposit.paymentType || '-'}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        deposit.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : deposit.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : deposit.status === 'reversed'
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-amber-100 text-amber-700'
                      }`}
                      >
                        {deposit.status}
                      </span>
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

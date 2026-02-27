import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'

function WithdrawalHistory() {
  const { withdrawals } = useApp()
  const myWithdrawals = useMemo(
    () => withdrawals.filter((withdrawal) => withdrawal.userId === 'current-user'),
    [withdrawals],
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Withdrawal History</h1>
        <p className="text-gray-600 mt-1">See all withdrawal requests you have made and their current status.</p>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">Date</th>
                <th className="p-3">Amount (USD)</th>
                <th className="p-3">Payout</th>
                <th className="p-3">Account</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {myWithdrawals.length === 0 ? (
                <tr className="border-t">
                  <td className="p-4 text-gray-500" colSpan={5}>No withdrawals yet.</td>
                </tr>
              ) : (
                myWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-t">
                    <td className="p-3">{withdrawal.date ? new Date(withdrawal.date).toLocaleString() : '-'}</td>
                    <td className="p-3">${Number(withdrawal.amountUsd || 0).toFixed(2)}</td>
                    <td className="p-3">
                      {withdrawal.currency} {Number(withdrawal.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3">{withdrawal.accountNumber || '-'}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        withdrawal.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : withdrawal.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : withdrawal.status === 'reversed'
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-amber-100 text-amber-700'
                      }`}
                      >
                        {withdrawal.status}
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

export default WithdrawalHistory

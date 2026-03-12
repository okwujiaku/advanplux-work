import { useOutletContext } from 'react-router-dom'
import { getUserDisplay } from './memberDisplay'

const USD_TO_NGN = 1450
const USD_TO_CFA = 600
const USD_TO_RWF = 1500

function formatPayoutInUserCurrency(netUsd, currency) {
  if (!currency || !Number.isFinite(netUsd)) return null
  const cur = String(currency).toUpperCase()
  if (cur === 'NGN') return `₦${Math.round(netUsd * USD_TO_NGN).toLocaleString()}`
  if (cur === 'CFA') return `CFA ${Math.round(netUsd * USD_TO_CFA).toLocaleString()}`
  if (cur === 'RWF') return `RWF ${Math.round(netUsd * USD_TO_RWF).toLocaleString()}`
  return null
}

function AdminWithdrawalsPage() {
  const { withdrawals, approveWithdrawal, rejectWithdrawal, members } = useOutletContext()
  const getUserLabel = (userId) => getUserDisplay(userId, members)
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending')

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b dark:border-gray-700">Members withdrawals</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 px-4 pb-2">Pending requests only. Approved, rejected, or reversed withdrawals appear in Withdrawal History.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-left">
              <th className="p-3 dark:text-gray-200">Date</th>
              <th className="p-3 dark:text-gray-200">User</th>
              <th className="p-3 dark:text-gray-200">Amount</th>
              <th className="p-3 dark:text-gray-200">Currency</th>
              <th className="p-3 whitespace-nowrap dark:text-gray-200">Full withdrawal details</th>
              <th className="p-3 dark:text-gray-200">Status</th>
              <th className="p-3 dark:text-gray-200">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingWithdrawals.length === 0 ? <tr><td colSpan={7} className="p-4 text-gray-500 dark:text-gray-400">No pending withdrawal requests.</td></tr> : pendingWithdrawals.map((w) => {
              const bank = w.bankName || '–'
              const accName = w.accountName || '–'
              const accNum = w.accountNumber || '–'
              return (
              <tr key={w.id} className="border-t dark:border-gray-700">
                <td className="p-3 dark:text-gray-200">{new Date(w.date).toLocaleString()}</td>
                <td className="p-3 dark:text-gray-200">{getUserLabel(w.userId)}</td>
                <td className="p-3">
                  <p className="font-medium dark:text-gray-200">${Number(w.amountUsd || 0).toFixed(2)}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">Fee: ${Number(w.feeUsd || 0).toFixed(2)}</p>
                  <p className="text-xs text-green-700 dark:text-green-400">Net: ${Number(w.netAmountUsd || 0).toFixed(2)}</p>
                  {formatPayoutInUserCurrency(Number(w.netAmountUsd || 0), w.currency) && (
                    <p className="text-xs text-slate-700 dark:text-gray-400 mt-1">Payout: {formatPayoutInUserCurrency(Number(w.netAmountUsd || 0), w.currency)}</p>
                  )}
                </td>
                <td className="p-3 dark:text-gray-200">{w.currency}</td>
                <td className="p-3 max-w-[200px]">
                  <span className="block font-mono dark:text-gray-200">{accNum}</span>
                  <span className="block text-gray-800 dark:text-gray-200">{accName}</span>
                  <span className="block text-gray-700 dark:text-gray-300">{bank}</span>
                </td>
                <td className="p-3 dark:text-gray-200">{w.status}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {w.status === 'pending' && (
                      <>
                        <button
                          onClick={async () => {
                            const ok = await approveWithdrawal(w.id)
                            if (!ok) alert('Cannot approve: user wallet is lower than request.')
                          }}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                        >
                          Approve
                        </button>
                        <button onClick={async () => await rejectWithdrawal(w.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminWithdrawalsPage

import { useOutletContext } from 'react-router-dom'
import { getUserDisplay } from './memberDisplay'

const USD_TO_NGN = 1450
const USD_TO_CFA = 600

function formatPayoutInUserCurrency(netUsd, currency) {
  if (!currency || !Number.isFinite(netUsd)) return null
  const cur = String(currency).toUpperCase()
  if (cur === 'NGN') return `₦${Math.round(netUsd * USD_TO_NGN).toLocaleString()}`
  if (cur === 'CFA') return `CFA ${Math.round(netUsd * USD_TO_CFA).toLocaleString()}`
  return null
}

function AdminWithdrawalsPage() {
  const { withdrawals, approveWithdrawal, rejectWithdrawal, members } = useOutletContext()
  const getUserLabel = (userId) => getUserDisplay(userId, members)
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending')

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Members withdrawals</h2>
      <p className="text-sm text-gray-600 px-4 pb-2">Pending requests only. Approved, rejected, or reversed withdrawals appear in Withdrawal History.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3">Date</th>
              <th className="p-3">User</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Currency</th>
              <th className="p-3 whitespace-nowrap">Full withdrawal details</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingWithdrawals.length === 0 ? <tr><td colSpan={7} className="p-4 text-gray-500">No pending withdrawal requests.</td></tr> : pendingWithdrawals.map((w) => {
              const bank = w.bankName || '–'
              const accName = w.accountName || '–'
              const accNum = w.accountNumber || '–'
              return (
              <tr key={w.id} className="border-t">
                <td className="p-3">{new Date(w.date).toLocaleString()}</td>
                <td className="p-3">{getUserLabel(w.userId)}</td>
                <td className="p-3">
                  <p className="font-medium">${Number(w.amountUsd || 0).toFixed(2)}</p>
                  <p className="text-xs text-amber-700">Fee: ${Number(w.feeUsd || 0).toFixed(2)}</p>
                  <p className="text-xs text-green-700">Net: ${Number(w.netAmountUsd || 0).toFixed(2)}</p>
                  {formatPayoutInUserCurrency(Number(w.netAmountUsd || 0), w.currency) && (
                    <p className="text-xs text-slate-700 mt-1">Payout: {formatPayoutInUserCurrency(Number(w.netAmountUsd || 0), w.currency)}</p>
                  )}
                </td>
                <td className="p-3">{w.currency}</td>
                <td className="p-3 max-w-[200px]">
                  <span className="block font-mono">{accNum}</span>
                  <span className="block text-gray-800">{accName}</span>
                  <span className="block text-gray-700">{bank}</span>
                </td>
                <td className="p-3">{w.status}</td>
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

import { useOutletContext } from 'react-router-dom'
import { getUserDisplay } from './memberDisplay'

function AdminHistoryPage() {
  const { investmentHistory, deposits, withdrawals, bonusWithdrawals, members } = useOutletContext()
  const getUserLabel = (id) => getUserDisplay(id, members)

  return (
    <div className="space-y-4">
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b dark:border-gray-700">Investment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-left"><th className="p-3 dark:text-gray-200">Date</th><th className="p-3">User</th><th className="p-3">Type</th><th className="p-3">Amount</th></tr></thead>
            <tbody>{investmentHistory.length === 0 ? <tr><td colSpan={4} className="p-4 text-gray-500 dark:text-gray-400">No history yet.</td></tr> : investmentHistory.map((h) => (<tr key={h.id} className="border-t dark:border-gray-700"><td className="p-3 dark:text-gray-200">{new Date(h.date).toLocaleString()}</td><td className="p-3 dark:text-gray-200">{getUserLabel(h.memberId)}</td><td className="p-3 dark:text-gray-200">{h.type}</td><td className="p-3 dark:text-gray-200">₦{h.amount.toLocaleString()}</td></tr>))}</tbody>
          </table>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b dark:border-gray-700">Deposit History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-left"><th className="p-3 dark:text-gray-200">Date</th><th className="p-3">User</th><th className="p-3">Amount</th><th className="p-3">Currency</th><th className="p-3">Status</th></tr></thead>
            <tbody>{deposits.length === 0 ? <tr><td colSpan={5} className="p-4 text-gray-500 dark:text-gray-400">No deposits yet.</td></tr> : deposits.map((d) => (<tr key={d.id} className="border-t dark:border-gray-700"><td className="p-3 dark:text-gray-200">{new Date(d.date).toLocaleString()}</td><td className="p-3 dark:text-gray-200">{getUserLabel(d.userId)}</td><td className="p-3 dark:text-gray-200">{d.amount?.toLocaleString()}</td><td className="p-3 dark:text-gray-200">{d.currency}</td><td className="p-3 dark:text-gray-200">{d.status}</td></tr>))}</tbody>
          </table>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b dark:border-gray-700">Withdrawal History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-left"><th className="p-3 dark:text-gray-200">Date</th><th className="p-3">User</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr></thead>
            <tbody>{withdrawals.length === 0 ? <tr><td colSpan={4} className="p-4 text-gray-500 dark:text-gray-400">No withdrawals yet.</td></tr> : withdrawals.map((w) => (<tr key={w.id} className="border-t dark:border-gray-700"><td className="p-3 dark:text-gray-200">{new Date(w.date).toLocaleString()}</td><td className="p-3 dark:text-gray-200">{getUserLabel(w.userId)}</td><td className="p-3 dark:text-gray-200">${Number(w.amountUsd || 0).toFixed(2)}</td><td className="p-3 dark:text-gray-200">{w.status}</td></tr>))}</tbody>
          </table>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b dark:border-gray-700">Bonus Withdrawal History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-left"><th className="p-3 dark:text-gray-200">Date</th><th className="p-3">User</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr></thead>
            <tbody>{bonusWithdrawals.length === 0 ? <tr><td colSpan={4} className="p-4 text-gray-500 dark:text-gray-400">No bonus withdrawals yet.</td></tr> : bonusWithdrawals.map((w) => (<tr key={w.id} className="border-t dark:border-gray-700"><td className="p-3 dark:text-gray-200">{new Date(w.date).toLocaleString()}</td><td className="p-3 dark:text-gray-200">{getUserLabel(w.userId)}</td><td className="p-3 dark:text-gray-200">₦{w.amount.toLocaleString()}</td><td className="p-3 dark:text-gray-200">{w.status}</td></tr>))}</tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default AdminHistoryPage

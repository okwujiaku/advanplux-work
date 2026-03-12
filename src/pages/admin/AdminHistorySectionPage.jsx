import { useLocation, useOutletContext, useParams } from 'react-router-dom'
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

function AdminHistorySectionPage() {
  const { section: sectionParam } = useParams()
  const location = useLocation()
  const section = sectionParam || location.pathname.split('/').filter(Boolean).pop()
  const { investmentHistory, deposits, withdrawals, bonusWithdrawals, members } = useOutletContext()

  const getUserLabel = (id) => getUserDisplay(id, members)

  if (section === 'investment-history') {
    return (
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">Investment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-left"><th className="p-3 text-gray-900 dark:text-gray-200">Date</th><th className="p-3">User</th><th className="p-3">Type</th><th className="p-3">Amount</th></tr></thead>
            <tbody>{investmentHistory.length === 0 ? <tr><td colSpan={4} className="p-4 text-gray-500 dark:text-gray-400">No history yet.</td></tr> : investmentHistory.map((h) => (<tr key={h.id} className="border-t border-gray-200 dark:border-gray-700"><td className="p-3 text-gray-900 dark:text-gray-200">{new Date(h.date).toLocaleString()}</td><td className="p-3 text-gray-900 dark:text-gray-200">{getUserLabel(h.memberId)}</td><td className="p-3 text-gray-900 dark:text-gray-200">{h.type}</td><td className="p-3 text-gray-900 dark:text-gray-200">₦{h.amount.toLocaleString()}</td></tr>))}</tbody>
          </table>
        </div>
      </section>
    )
  }

  if (section === 'deposit-history') {
    return (
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">Deposit History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-left"><th className="p-3 text-gray-900 dark:text-gray-200">Date</th><th className="p-3">User</th><th className="p-3">Amount</th><th className="p-3">Currency</th><th className="p-3">Status</th></tr></thead>
            <tbody>{deposits.length === 0 ? <tr><td colSpan={5} className="p-4 text-gray-500 dark:text-gray-400">No deposits yet.</td></tr> : deposits.map((d) => (<tr key={d.id} className="border-t border-gray-200 dark:border-gray-700"><td className="p-3 text-gray-900 dark:text-gray-200">{new Date(d.date).toLocaleString()}</td><td className="p-3 text-gray-900 dark:text-gray-200">{getUserLabel(d.userId)}</td><td className="p-3 text-gray-900 dark:text-gray-200">{d.amount?.toLocaleString()}</td><td className="p-3 text-gray-900 dark:text-gray-200">{d.currency}</td><td className="p-3 text-gray-900 dark:text-gray-200">{d.status}</td></tr>))}</tbody>
          </table>
        </div>
      </section>
    )
  }

  if (section === 'withdrawal-history') {
    const withdrawalHistory = withdrawals.filter((w) => w.status === 'approved' || w.status === 'rejected')
    return (
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">Withdrawal History</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 px-4 pb-2">Approved and rejected withdrawals.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-left"><th className="p-3 text-gray-900 dark:text-gray-200">Date</th><th className="p-3">User</th><th className="p-3">Amount (USD)</th><th className="p-3">Payout</th><th className="p-3">Status</th></tr></thead>
            <tbody>{withdrawalHistory.length === 0 ? <tr><td colSpan={5} className="p-4 text-gray-500 dark:text-gray-400">No withdrawal history yet.</td></tr> : withdrawalHistory.map((w) => (<tr key={w.id} className="border-t border-gray-200 dark:border-gray-700"><td className="p-3 text-gray-900 dark:text-gray-200">{new Date(w.date).toLocaleString()}</td><td className="p-3 text-gray-900 dark:text-gray-200">{getUserLabel(w.userId)}</td><td className="p-3 text-gray-900 dark:text-gray-200">${Number(w.netAmountUsd ?? w.amountUsd ?? 0).toFixed(2)}</td><td className="p-3 text-gray-900 dark:text-gray-200">{formatPayoutInUserCurrency(Number(w.netAmountUsd ?? w.amountUsd ?? 0), w.currency) || w.currency}</td><td className="p-3 text-gray-900 dark:text-gray-200">{w.status}</td></tr>))}</tbody>
          </table>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">Bonus Withdrawal History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-left"><th className="p-3 text-gray-900 dark:text-gray-200">Date</th><th className="p-3">User</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr></thead>
            <tbody>{bonusWithdrawals.length === 0 ? <tr><td colSpan={4} className="p-4 text-gray-500 dark:text-gray-400">No bonus withdrawals yet.</td></tr> : bonusWithdrawals.map((w) => (<tr key={w.id} className="border-t border-gray-200 dark:border-gray-700"><td className="p-3 text-gray-900 dark:text-gray-200">{new Date(w.date).toLocaleString()}</td><td className="p-3 text-gray-900 dark:text-gray-200">{getUserLabel(w.userId)}</td><td className="p-3 text-gray-900 dark:text-gray-200">₦{w.amount.toLocaleString()}</td><td className="p-3 text-gray-900 dark:text-gray-200">{w.status}</td></tr>))}</tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminHistorySectionPage

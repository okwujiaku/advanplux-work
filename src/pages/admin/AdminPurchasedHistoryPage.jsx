import { useOutletContext } from 'react-router-dom'
import { getUserDisplay } from './memberDisplay'

function AdminPurchasedHistoryPage() {
  const { purchasedHistory, deposits = [], members } = useOutletContext()
  const list = Array.isArray(purchasedHistory)
    ? purchasedHistory
    : deposits.filter((d) => d.status === 'approved' && d.pack).map((d) => ({ id: d.id, userId: d.userId, pack: d.pack, amount: d.amount, currency: d.currency, date: d.approvedAt || d.date, source: 'deposit' }))

  const depositCell = (row) => {
    if (row.source === 'activation') return 'From balance'
    const amt = row.amount != null ? Number(String(row.amount).replace(/\s/g, '')) : null
    return amt != null && !Number.isNaN(amt) ? `${row.currency || ''} ${amt.toLocaleString()}`.trim() : (row.currency || '—')
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Purchased engine history</h2>
      <p className="text-sm text-gray-600 px-4 pb-2">Every Ads Engine pack purchased by any member (deposits with pack + activations from balance).</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left"><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Package</th><th className="p-3">Deposit</th></tr></thead>
          <tbody>{list.length === 0 ? <tr><td colSpan={4} className="p-4 text-gray-500">No purchased engine history yet.</td></tr> : list.map((row) => (<tr key={row.id} className="border-t"><td className="p-3">{new Date(row.date).toLocaleString()}</td><td className="p-3">{getUserDisplay(row.userId, members)}</td><td className="p-3">${row.pack}</td><td className="p-3">{depositCell(row)}</td></tr>))}</tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminPurchasedHistoryPage

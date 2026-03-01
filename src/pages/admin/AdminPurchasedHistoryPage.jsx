import { useOutletContext } from 'react-router-dom'
import { getUserDisplay } from './memberDisplay'

function AdminPurchasedHistoryPage() {
  const { deposits, members } = useOutletContext()
  const purchasedHistory = deposits.filter((d) => d.status === 'approved' && d.pack)

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Purchased engine history</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left"><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Package</th><th className="p-3">Deposit</th></tr></thead>
          <tbody>{purchasedHistory.length === 0 ? <tr><td colSpan={4} className="p-4 text-gray-500">No purchased engine history yet.</td></tr> : purchasedHistory.map((d) => (<tr key={d.id} className="border-t"><td className="p-3">{new Date(d.approvedAt || d.date).toLocaleString()}</td><td className="p-3">{getUserDisplay(d.userId, members)}</td><td className="p-3">${d.pack}</td><td className="p-3">{d.currency} {d.amount?.toLocaleString()}</td></tr>))}</tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminPurchasedHistoryPage

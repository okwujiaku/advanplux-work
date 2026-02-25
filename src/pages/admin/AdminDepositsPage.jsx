import { useOutletContext } from 'react-router-dom'

function AdminDepositsPage() {
  const { deposits, approveDeposit, rejectDeposit, reverseDeposit } = useOutletContext()

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Confirm Pending Deposit</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left"><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Amount</th><th className="p-3">Currency</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {deposits.length === 0 ? <tr><td colSpan={6} className="p-4 text-gray-500">No deposits yet.</td></tr> : deposits.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-3">{new Date(d.date).toLocaleString()}</td>
                <td className="p-3">{d.userId}</td>
                <td className="p-3">{d.amount?.toLocaleString()}</td>
                <td className="p-3">{d.currency}</td>
                <td className="p-3">{d.status}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {d.status === 'pending' && (
                      <>
                        <button onClick={() => approveDeposit(d.id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Confirm</button>
                        <button onClick={() => rejectDeposit(d.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
                      </>
                    )}
                    {d.status === 'approved' && <button onClick={() => reverseDeposit(d.id)} className="px-2 py-1 bg-gray-700 text-white rounded text-xs">Reverse</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminDepositsPage

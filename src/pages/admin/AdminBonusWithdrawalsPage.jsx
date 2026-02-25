import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

function AdminBonusWithdrawalsPage() {
  const { members, bonusWithdrawals, createBonusWithdrawal, approveBonusWithdrawal } = useOutletContext()
  const [form, setForm] = useState({ memberId: 'current-user', amount: '', accountNumber: '' })

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Bonus withdrawals</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <select value={form.memberId} onChange={(e) => setForm((p) => ({ ...p, memberId: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg">{members.map((member) => <option key={member.id} value={member.id}>{member.id}</option>)}</select>
        <input value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Amount" className="px-4 py-3 border border-gray-300 rounded-lg" />
        <input value={form.accountNumber} onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))} placeholder="Account number" className="px-4 py-3 border border-gray-300 rounded-lg" />
      </div>
      <button
        onClick={() => {
          createBonusWithdrawal(form)
          setForm((p) => ({ ...p, amount: '', accountNumber: '' }))
        }}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        Create bonus withdrawal
      </button>
      <div className="space-y-2">
        {bonusWithdrawals.map((w) => (
          <div key={w.id} className="border border-gray-200 rounded-lg p-3 text-sm flex items-center justify-between">
            <span>{w.userId} · ₦{w.amount.toLocaleString()} · {w.accountNumber} · {w.status}</span>
            {w.status === 'pending' && <button onClick={() => approveBonusWithdrawal(w.id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>}
          </div>
        ))}
      </div>
    </section>
  )
}

export default AdminBonusWithdrawalsPage

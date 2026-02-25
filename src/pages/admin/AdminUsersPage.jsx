import { useOutletContext } from 'react-router-dom'

function AdminUsersPage() {
  const { members } = useOutletContext()

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Registered Members</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left"><th className="p-3">S/N</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Account ID</th><th className="p-3">Wallet</th><th className="p-3">Bonus</th></tr></thead>
            <tbody>{members.map((member, index) => (<tr key={member.id} className="border-t"><td className="p-3">{index + 1}</td><td className="p-3">{member.name}</td><td className="p-3">{member.email}</td><td className="p-3 font-mono">{member.id}</td><td className="p-3">₦{member.balance.toLocaleString()}</td><td className="p-3">₦{member.bonusBalance.toLocaleString()}</td></tr>))}</tbody>
          </table>
        </div>
      </section>

    </div>
  )
}

export default AdminUsersPage

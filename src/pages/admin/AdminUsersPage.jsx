import { useOutletContext } from 'react-router-dom'

function AdminUsersPage() {
  const { members } = useOutletContext()
  const displayMembers = members.filter((member) => member.id !== 'current-user')

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Registered Members</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">S/N</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Invitation code</th>
                <th className="p-3">Referred by</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Account ID</th>
                <th className="p-3">Wallet</th>
                <th className="p-3">Bonus</th>
              </tr>
            </thead>
            <tbody>
              {displayMembers.length === 0 ? (
                <tr className="border-t">
                  <td className="p-4 text-gray-500" colSpan={10}>No registered users yet.</td>
                </tr>
              ) : (
                displayMembers.map((member, index) => (
                  <tr key={member.id} className="border-t">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{member.name}</td>
                    <td className="p-3">{member.email || '-'}</td>
                    <td className="p-3">{member.phone || '-'}</td>
                    <td className="p-3 font-mono">{member.invitationCode || '-'}</td>
                    <td className="p-3 font-mono">{member.referredByUserId || '-'}</td>
                    <td className="p-3">{member.joinedAt ? new Date(member.joinedAt).toLocaleString() : '-'}</td>
                    <td className="p-3 font-mono">{member.id}</td>
                    <td className="p-3">₦{Number(member.balance || 0).toLocaleString()}</td>
                    <td className="p-3">₦{Number(member.bonusBalance || 0).toLocaleString()}</td>
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

export default AdminUsersPage

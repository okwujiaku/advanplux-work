import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

function formatAccountId(member) {
  const phone = String(member.phone || '').trim()
  if (phone) return phone
  const rawId = String(member.id || '')
  if (rawId.length <= 12) return rawId || '-'
  return `${rawId.slice(0, 6)}...${rawId.slice(-4)}`
}

function AdminUsersPage() {
  const { members, deleteUserAccount } = useOutletContext()
  const [searchTerm, setSearchTerm] = useState('')
  const displayMembers = members.filter((member) => member.id !== 'current-user')
  const filteredMembers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return displayMembers
    return displayMembers.filter((member) => {
      const joinedText = member.joinedAt ? new Date(member.joinedAt).toLocaleString() : ''
      const searchable = [
        member.name,
        member.email,
        member.phone,
        member.invitationCode,
        member.referredByUserId,
        member.id,
        joinedText,
      ]
        .map((value) => String(value || '').toLowerCase())
        .join(' ')
      return searchable.includes(query)
    })
  }, [displayMembers, searchTerm])

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Registered Members</h2>
        <div className="p-4 border-b bg-gray-50">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, invitation code, referred by, or account ID..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
          />
        </div>
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
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayMembers.length === 0 ? (
                <tr className="border-t">
                  <td className="p-4 text-gray-500" colSpan={10}>No registered users yet.</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr className="border-t">
                  <td className="p-4 text-gray-500" colSpan={11}>No members match your search.</td>
                </tr>
              ) : (
                filteredMembers.map((member, index) => (
                  <tr key={member.id} className="border-t">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{member.name}</td>
                    <td className="p-3">{member.email || '-'}</td>
                    <td className="p-3">{member.phone || '-'}</td>
                    <td className="p-3 font-mono">{member.invitationCode || '-'}</td>
                    <td className="p-3 font-mono">{member.referredByUserId || '-'}</td>
                    <td className="p-3">{member.joinedAt ? new Date(member.joinedAt).toLocaleString() : '-'}</td>
                    <td className="p-3 font-mono">{formatAccountId(member)}</td>
                    <td className="p-3">${Number(member.balance || 0).toLocaleString()}</td>
                    <td className="p-3">${Number(member.bonusBalance || 0).toLocaleString()}</td>
                    <td className="p-3 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window === 'undefined') return
                          try {
                            const storage = window.localStorage
                            storage.setItem('authCurrentUserId', JSON.stringify(member.id))
                            const nextSession = { userId: member.id, email: member.email }
                            storage.setItem('authSession', JSON.stringify(nextSession))
                            let authUsers = []
                            try {
                              const raw = storage.getItem('authUsers')
                              authUsers = raw ? JSON.parse(raw) : []
                            } catch {
                              authUsers = []
                            }
                            if (!Array.isArray(authUsers)) authUsers = []
                            const exists = authUsers.some((u) => u.id === member.id)
                            if (!exists) {
                              authUsers.push({
                                id: member.id,
                                email: member.email || '',
                                phone: member.phone || '',
                                password: '',
                                myInvitationCode: member.invitationCode || '',
                                referredByUserId: member.referredByUserId || null,
                                createdAt: member.joinedAt || new Date().toISOString(),
                              })
                              storage.setItem('authUsers', JSON.stringify(authUsers))
                            }
                          } catch {
                            // ignore storage errors
                          }
                          window.open('/dashboard', '_blank')
                        }}
                        className="block w-full rounded bg-primary-600 px-2 py-1 text-xs font-medium text-white hover:bg-primary-700"
                      >
                        View dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (member.id === 'current-user') return
                          if (window.confirm('Are you sure you want to permanently delete this user account?')) {
                            deleteUserAccount?.(member.id)
                          }
                        }}
                        className="block w-full rounded border border-red-500 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete account
                      </button>
                    </td>
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

import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { getMemberDisplay } from './memberDisplay'

function AdminUsersPage() {
  const { members, setSelectedMemberId, setMemberBanned, getAdminKey } = useOutletContext()
  const navigate = useNavigate()
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
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b dark:border-gray-700">Registered Members</h2>
        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, invitation code, or referred by..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-left">
                <th className="p-3 dark:text-gray-200">S/N</th>
                <th className="p-3 dark:text-gray-200">Account ID</th>
                <th className="p-3 dark:text-gray-200">Name</th>
                <th className="p-3 dark:text-gray-200">Email</th>
                <th className="p-3 dark:text-gray-200">Phone</th>
                <th className="p-3 dark:text-gray-200">Invitation code</th>
                <th className="p-3 dark:text-gray-200">Referred by</th>
                <th className="p-3 dark:text-gray-200">Balance</th>
                <th className="p-3 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayMembers.length === 0 ? (
                <tr className="border-t dark:border-gray-700">
                  <td className="p-4 text-gray-500 dark:text-gray-400" colSpan={10}>No registered users yet.</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr className="border-t dark:border-gray-700">
                  <td className="p-4 text-gray-500 dark:text-gray-400" colSpan={10}>No members match your search.</td>
                </tr>
              ) : (
                filteredMembers.map((member, index) => {
                  const referrer = members.find((m) => m.id === member.referredByUserId)
                  const referrerLabel = referrer ? referrer.invitationCode : (member.referredByUserId ? '–' : '–')
                  const accountId = member.invitationCode || (member.email || '').split('@')[0] || member.id
                  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                  const isUuidEmail = uuidRegex.test(member.email || '')
                  const isUuidName = uuidRegex.test(member.name || '')
                  const displayLabel = getMemberDisplay(member)
                  const emailDisplay = member.email && !isUuidEmail ? member.email : displayLabel
                  const emailLocal = (member.email || '').split('@')[0]
                  const hasRealName = member.name && !isUuidName && member.name !== member.email
                  const nameDisplay = hasRealName ? member.name : (emailLocal || displayLabel)
                  return (
                  <tr key={member.id} className="border-t dark:border-gray-700">
                    <td className="p-3 dark:text-gray-200">{index + 1}</td>
                    <td className="p-3 font-mono dark:text-gray-200">{accountId}</td>
                    <td className="p-3 dark:text-gray-200">{nameDisplay}</td>
                    <td className="p-3 dark:text-gray-200">{emailDisplay || '-'}</td>
                    <td className="p-3 dark:text-gray-200">{member.phone || '-'}</td>
                    <td className="p-3 font-mono dark:text-gray-200">{member.invitationCode || '-'}</td>
                    <td className="p-3 dark:text-gray-200">{referrerLabel}</td>
                    <td className="p-3 dark:text-gray-200">${Number(member.balance ?? 0).toFixed(2)}</td>
                    <td className="p-3 space-y-1">
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window === 'undefined') return
                            try {
                              const storage = window.localStorage
                              storage.setItem('adminViewAsUserId', member.id)
                              const adminKey = (typeof getAdminKey === 'function' ? getAdminKey() : '') ||
                                (window.sessionStorage?.getItem('adminApiKey') || '') ||
                                (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_SECRET) || ''
                              if (adminKey) storage.setItem('adminViewAsKey', adminKey)
                              window.open('/dashboard', '_blank')
                            } catch {
                              // ignore
                            }
                          }}
                          className="rounded bg-primary-600 px-2 py-1 text-xs font-medium text-white hover:bg-primary-700"
                        >
                          View dashboard
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (member.id === 'current-user') return
                            setSelectedMemberId?.(member.id)
                            navigate('/admin/edit-users')
                          }}
                          className="rounded border border-amber-500 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 dark:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                        >
                          Edit user info
                        </button>
                        {member.id !== 'current-user' && setMemberBanned && (
                          <button
                            type="button"
                            onClick={() => setMemberBanned(member.id, !member.banned)}
                            title={member.banned ? 'Activate user' : 'Ban user'}
                            className={`rounded px-2 py-1 text-xs font-medium text-white ${member.banned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                          >
                            {member.banned ? '✓ Activate' : '⊘ Ban'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}

export default AdminUsersPage

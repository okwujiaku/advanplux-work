import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'

function Profile() {
  const { currentUser, users } = useApp()

  const referredByDisplay = useMemo(() => {
    if (!currentUser?.referredByUserId) return null
    const referrer = users.find((u) => u.id === currentUser.referredByUserId)
    return (currentUser.referrerInvitationCode != null && currentUser.referrerInvitationCode !== '')
      ? currentUser.referrerInvitationCode
      : referrer?.invitationCode ?? referrer?.myInvitationCode ?? null
  }, [currentUser, users])

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white px-4 py-3 border-b border-slate-100 dark:border-gray-700 bg-slate-50/80 dark:bg-gray-700/50">
          My profile
        </h1>
        <div className="p-4 sm:p-5">
          {currentUser ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-slate-500 dark:text-gray-400 font-medium">Email</dt>
                <dd className="mt-0.5 text-slate-900 dark:text-gray-200 break-all">{currentUser.email || '–'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-gray-400 font-medium">Phone</dt>
                <dd className="mt-0.5 text-slate-900 dark:text-gray-200">{currentUser.phone || '–'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-gray-400 font-medium">My invitation code</dt>
                <dd className="mt-0.5 font-mono font-semibold text-primary-600 dark:text-primary-400">{currentUser.myInvitationCode || '–'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-gray-400 font-medium">Referred by</dt>
                <dd className="mt-0.5 font-mono text-slate-900 dark:text-gray-200">
                  {referredByDisplay ?? '–'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-gray-400 font-medium">Joined</dt>
                <dd className="mt-0.5 text-slate-900 dark:text-gray-200">
                  {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleString() : '–'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-slate-500 dark:text-gray-400 text-sm">Not signed in.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile


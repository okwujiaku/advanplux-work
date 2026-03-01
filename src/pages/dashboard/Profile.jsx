import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'

function Profile() {
  const { currentUser, users } = useApp()

  const referrer = useMemo(() => {
    if (!currentUser?.referredByUserId) return null
    return users.find((u) => u.id === currentUser.referredByUserId) || null
  }, [currentUser, users])

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          My profile
        </h1>
        <div className="p-4 sm:p-5">
          {currentUser ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-slate-500 font-medium">Email</dt>
                <dd className="mt-0.5 text-slate-900 break-all">{currentUser.email || '–'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Phone</dt>
                <dd className="mt-0.5 text-slate-900">{currentUser.phone || '–'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">My invitation code</dt>
                <dd className="mt-0.5 font-mono font-semibold text-primary-600">{currentUser.myInvitationCode || '–'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Referred by</dt>
                <dd className="mt-0.5 text-slate-900">
                  {referrer
                    ? (referrer.email || (referrer.email && referrer.email.split('@')[0]) || referrer.phone || referrer.id)
                    : currentUser.referredByUserId
                      ? '–'
                      : '–'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Joined</dt>
                <dd className="mt-0.5 text-slate-900">
                  {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleString() : '–'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-slate-500 text-sm">Not signed in.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile


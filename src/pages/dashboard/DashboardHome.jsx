import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

function DashboardHome() {
  const { currentUser, users, userPack, PACKS_USD, adsViewedToday, walletUsd, referralEarnings, claimedSalary } = useApp()
  const packInfo = userPack ? PACKS_USD.find((p) => p.usd === userPack) : null
  const earnedTodayUsd = (adsViewedToday * 0.4).toFixed(2)
  const referralTotalNgn =
    Number(referralEarnings.level1 || 0) +
    Number(referralEarnings.level2 || 0) +
    Number(referralEarnings.level3 || 0)
  const referralTotalUsd = referralTotalNgn > 0 ? referralTotalNgn / 1450 : 0
  const totalBalanceUsd = Number(walletUsd || 0) + Number(referralTotalUsd || 0) + Number(claimedSalary || 0)
  const referrer = currentUser?.referredByUserId ? users.find((u) => u.id === currentUser.referredByUserId) : null
  const bannerMessages = [
    'Watch ads and get paid in dollars on Advanplux.',
    'Start making money on Advanplux by watching ads daily.',
    'Complete your ad views and earnings are added automatically.',
    'Buy an Ads Engine package to unlock higher daily ad limits.',
    'Build your team and increase your referral and weekly rewards.',
  ]
  const [bannerIndex, setBannerIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prevIndex) => (prevIndex + 1) % bannerMessages.length)
    }, 3200)

    return () => clearInterval(interval)
  }, [bannerMessages.length])

  const actions = [
    { label: 'Deposit', to: '/dashboard/deposit', icon: '💳' },
    { label: 'Withdraw', to: '/dashboard/withdrawal', icon: '💸' },
    { label: 'Purchase Ads Engine', to: '/dashboard/purchase', icon: '🛒' },
    { label: 'My Ads Engine', to: '/dashboard/watch', icon: '📺' },
    { label: 'Redeem Gift code', to: '/dashboard/redeem-gift-code', icon: '🎁' },
    { label: 'Announcement', to: '/dashboard/announcements', icon: '📢' },
    { label: 'Referral', to: '/dashboard/referral', icon: '👥' },
    { label: 'Team', to: '/dashboard/team', icon: '🤝' },
    { label: 'Support - Customer Service', to: '/dashboard/support-center', icon: '🛟' },
    { label: 'Community', href: 'https://t.me/Advanplux', icon: '🌐' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Profile – registration details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          My profile
        </h2>
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
                <dt className="text-slate-500 font-medium">Account ID</dt>
                <dd className="mt-0.5 font-mono text-slate-900 break-all">{currentUser.id || '–'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">My invitation code</dt>
                <dd className="mt-0.5 font-mono font-semibold text-primary-600">{currentUser.myInvitationCode || '–'}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Referred by</dt>
                <dd className="mt-0.5 text-slate-900">
                  {referrer ? `${referrer.email || referrer.id} (${referrer.myInvitationCode || referrer.id})` : currentUser.referredByUserId ? currentUser.referredByUserId : '–'}
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

      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f3d9a_0%,#1d4ed8_55%,#2563eb_100%)] rounded-xl text-white p-4 sm:p-6 shadow-xl border border-blue-700">
        <div className="pointer-events-none absolute -top-12 -right-10 w-40 h-40 rounded-full bg-cyan-300/35 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-blue-300/25 blur-xl" />
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-6">
          <div>
            <p className="text-sm text-white/85">Today earnings</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1">${earnedTodayUsd}</p>
            <p className="text-xs sm:text-sm text-white/85 mt-1 sm:mt-2">
              {packInfo ? `${packInfo.planName} · ${packInfo.adsPerDay} ads/day` : 'No package activated yet'}
            </p>
          </div>
          <div className="sm:border-l sm:border-white/30 sm:pl-6">
            <p className="text-2xl sm:text-3xl font-bold mt-1">${totalBalanceUsd.toFixed(2)}</p>
            <p className="text-xs sm:text-sm text-white/85 mt-1 sm:mt-2">Total balance</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p key={bannerIndex} className="text-xs sm:text-base font-semibold text-slate-700 transition-all duration-500">
            {bannerMessages[bannerIndex]}
          </p>
          <div className="flex items-center gap-1.5">
            {bannerMessages.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === bannerIndex ? 'w-5 bg-blue-500' : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-white rounded-xl border border-slate-200 p-3.5 sm:p-5 shadow-lg">
        <div className="pointer-events-none absolute top-0 right-0 h-full w-28 opacity-40 bg-[linear-gradient(180deg,transparent_0%,#dbeafe_100%)]" />
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Quick links</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {actions.map((action) =>
            action.href ? (
              <a
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                className="aspect-square p-2 sm:p-3 rounded-md border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] text-center flex flex-col items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1 rounded-md bg-blue-100 ring-1 ring-blue-200 flex items-center justify-center text-xl sm:text-2xl">
                  <span>{action.icon}</span>
                </div>
                <p className="font-semibold text-slate-800 text-[11px] sm:text-xs leading-tight">{action.label}</p>
              </a>
            ) : (
              <Link key={action.label} to={action.to} className="aspect-square p-2 sm:p-3 rounded-md border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] text-center flex flex-col items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1 rounded-md bg-blue-100 ring-1 ring-blue-200 flex items-center justify-center text-xl sm:text-2xl">
                  <span>{action.icon}</span>
                </div>
                <p className="font-semibold text-slate-800 text-[11px] sm:text-xs leading-tight">{action.label}</p>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

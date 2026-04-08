import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

function DashboardHome() {
  const {
    currentUser,
    users,
    activePacks,
    PACKS_USD,
    adsViewedToday,
    walletUsd,
    referralEarnings,
    claimedSalary,
    earningsHistory,
    refetchWalletAndDeposits,
  } = useApp()
  const totalAdsPerDay =
    (activePacks || []).reduce((sum, packUsd) => sum + (PACKS_USD.find((p) => p.usd === packUsd)?.adsPerDay ?? 0), 0)
  const packLabel =
    activePacks.length === 0
      ? null
      : activePacks.length === 1
        ? PACKS_USD.find((p) => p.usd === activePacks[0])
        : null
  const packInfo = packLabel
  const earnedTodayUsd = useMemo(() => {
    if (!Array.isArray(earningsHistory) || earningsHistory.length === 0) return '0.00'
    const today = new Date()
    const isToday = (dateStr) => {
      if (!dateStr) return false
      const x = new Date(dateStr)
      return (
        x.getDate() === today.getDate() &&
        x.getMonth() === today.getMonth() &&
        x.getFullYear() === today.getFullYear()
      )
    }
    const total = earningsHistory
      .filter((e) => e && e.source === 'watch-ads' && isToday(e.date))
      .reduce((sum, e) => sum + (Number(e.amountUsd) || 0), 0)
    return total.toFixed(2)
  }, [earningsHistory])
  // Total balance = wallet only (referral & team commission are already credited to wallet in the API)
  const totalBalanceUsd = Number(walletUsd || 0)
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
    refetchWalletAndDeposits()
  }, [refetchWalletAndDeposits])

  const openLiveChat = () => {
    if (typeof window === 'undefined') return
    const api = window.Tawk_API
    if (api && typeof api.showWidget === 'function') {
      api.showWidget()
    }
    if (api && typeof api.maximize === 'function') {
      api.maximize()
      return
    }
    if (api && typeof api.toggle === 'function') {
      api.toggle()
      return
    }
    window.location.href = '/dashboard/support-center'
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prevIndex) => (prevIndex + 1) % bannerMessages.length)
    }, 3200)

    return () => clearInterval(interval)
  }, [bannerMessages.length])

  const actions = [
    { label: 'Deposit', to: '/dashboard/deposit', icon: '💳' },
    { label: 'Withdraw', to: '/dashboard/request-withdrawal', icon: '💸' },
    { label: 'Get Ads Engine', to: '/dashboard/purchase', icon: '🛒' },
    { label: 'Watch & Earn', to: '/dashboard/watch', icon: '📺' },
    { label: 'Redeem Gift code', to: '/dashboard/redeem-gift-code', icon: '🎁' },
    { label: 'Announcement', to: '/dashboard/announcements', icon: '📢' },
    { label: 'Referral', to: '/dashboard/referral', icon: '👥' },
    { label: 'Weekly Salary', to: '/dashboard/team', icon: '🤝' },
    { label: 'Contact Us', subLabel: 'Live chat', action: 'open-chat', icon: '💬' },
    { label: 'Community', href: 'https://chat.whatsapp.com/HNw0UYhzHgUAhubfNTTM8q?mode=hq1tcla', icon: '🌐' },
    { label: 'Promote your business with us', to: '/dashboard/promote-business', icon: '📣' },
    { label: 'About us', to: '/dashboard/about', icon: 'ℹ️' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0f3d9a_0%,#1d4ed8_55%,#2563eb_100%)] dark:bg-gray-800 dark:border-gray-700 rounded-xl text-white dark:text-gray-100 p-4 sm:p-6 shadow-xl border border-blue-700 dark:border-gray-700">
        <div className="pointer-events-none absolute -top-12 -right-10 w-40 h-40 rounded-full bg-cyan-300/35 dark:bg-gray-600/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-blue-300/25 dark:bg-gray-600/20 blur-xl" />
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-6">
          <div>
            <p className="text-sm text-white/85 dark:text-gray-400">Today earnings</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1">${earnedTodayUsd}</p>
            <p className="text-xs sm:text-sm text-white/85 dark:text-gray-400 mt-1 sm:mt-2">
              {totalAdsPerDay > 0
                ? packInfo
                  ? `${packInfo.planName} · ${totalAdsPerDay} ${totalAdsPerDay === 1 ? 'ad' : 'ads'}/day`
                  : `${totalAdsPerDay} ${totalAdsPerDay === 1 ? 'ad' : 'ads'}/day from your packs`
                : 'No package activated yet'}
            </p>
          </div>
          <div className="sm:border-l border-white/30 dark:border-gray-600 sm:pl-6">
            <p className="text-2xl sm:text-3xl font-bold mt-1">${totalBalanceUsd.toFixed(2)}</p>
            <p className="text-xs sm:text-sm text-white/85 dark:text-gray-400 mt-1 sm:mt-2">Total balance</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p key={bannerIndex} className="text-xs sm:text-base font-semibold text-slate-700 dark:text-gray-200 transition-all duration-500">
            {bannerMessages[bannerIndex]}
          </p>
          <div className="flex items-center gap-1.5">
            {bannerMessages.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === bannerIndex ? 'w-5 bg-blue-500 dark:bg-blue-400' : 'w-1.5 bg-slate-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-3.5 sm:p-5 shadow-lg">
        <div className="pointer-events-none absolute top-0 right-0 h-full w-28 opacity-40 bg-[linear-gradient(180deg,transparent_0%,#dbeafe_100%)] dark:bg-[linear-gradient(180deg,transparent_0%,#1e3a5f_100%)]" />
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">Quick links</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {actions.map((action) =>
            action.action === 'open-chat' ? (
              <button
                key={action.label}
                type="button"
                onClick={openLiveChat}
                className="aspect-square p-2 sm:p-3 rounded-md border border-slate-200 dark:border-gray-600 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] dark:bg-[linear-gradient(180deg,#374151_0%,#1f2937_100%)] text-center flex flex-col items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all w-full"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1 rounded-md bg-blue-100 dark:bg-blue-900/40 ring-1 ring-blue-200 dark:ring-blue-800 flex items-center justify-center text-xl sm:text-2xl">
                  <span>{action.icon}</span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-gray-200 text-[11px] sm:text-xs leading-tight">
                  <span className="block">{action.label}</span>
                  {action.subLabel && <span className="block">{action.subLabel}</span>}
                </p>
              </button>
            ) : action.href ? (
              <a
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                className="aspect-square p-2 sm:p-3 rounded-md border border-slate-200 dark:border-gray-600 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] dark:bg-[linear-gradient(180deg,#374151_0%,#1f2937_100%)] text-center flex flex-col items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1 rounded-md bg-blue-100 dark:bg-blue-900/40 ring-1 ring-blue-200 dark:ring-blue-800 flex items-center justify-center text-xl sm:text-2xl">
                  <span>{action.icon}</span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-gray-200 text-[11px] sm:text-xs leading-tight">{action.label}</p>
              </a>
            ) : (
              <Link key={action.label} to={action.to} className="aspect-square p-2 sm:p-3 rounded-md border border-slate-200 dark:border-gray-600 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] dark:bg-[linear-gradient(180deg,#374151_0%,#1f2937_100%)] text-center flex flex-col items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1 rounded-md bg-blue-100 dark:bg-blue-900/40 ring-1 ring-blue-200 dark:ring-blue-800 flex items-center justify-center text-xl sm:text-2xl">
                  <span>{action.icon}</span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-gray-200 text-[11px] sm:text-xs leading-tight">{action.label}</p>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

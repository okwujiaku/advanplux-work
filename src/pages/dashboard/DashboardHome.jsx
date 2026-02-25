import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

function DashboardHome() {
  const { userPack, PACKS_USD, adsViewedToday, walletUsd } = useApp()
  const packInfo = userPack ? PACKS_USD.find((p) => p.usd === userPack) : null
  const earnedTodayUsd = (adsViewedToday * 0.4).toFixed(2)
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#fff8ec_0%,#f7eedf_100%)] rounded-xl text-[#4a351f] p-6 shadow-lg border border-[#e9ddca]">
        <div className="pointer-events-none absolute -top-12 -right-10 w-40 h-40 rounded-full bg-[#efd2a7]/35 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-[#f5e7d3]/80 blur-xl" />
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-[#7c5b33]">Today earnings</p>
            <p className="text-3xl font-bold mt-1">${earnedTodayUsd}</p>
            <p className="text-sm text-[#7c5b33] mt-2">
              {packInfo ? `${packInfo.planName} · ${packInfo.adsPerDay} ads/day` : 'No package activated yet'}
            </p>
          </div>
          <div className="sm:border-l sm:border-[#e2d3bc] sm:pl-6">
            <p className="text-3xl font-bold mt-1">${Number(walletUsd || 0).toFixed(2)}</p>
            <p className="text-sm text-[#7c5b33] mt-2">Total earnings available for withdrawal</p>
          </div>
        </div>
      </div>

      <div className="bg-[#fffaf1] rounded-xl border border-[#ebdfcd] px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p key={bannerIndex} className="text-sm sm:text-base font-medium text-[#5f4527] transition-all duration-500">
            {bannerMessages[bannerIndex]}
          </p>
          <div className="flex items-center gap-1.5">
            {bannerMessages.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === bannerIndex ? 'w-5 bg-[#d6a466]' : 'w-1.5 bg-[#d9c8ae]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-[linear-gradient(140deg,#fff8ee_0%,#f6eddf_100%)] rounded-xl border border-[#e9ddca] p-5 shadow-lg">
        <div className="pointer-events-none absolute top-0 right-0 h-full w-28 opacity-30 bg-[linear-gradient(180deg,transparent_0%,#e8d3b0_100%)]" />
        <h2 className="text-lg font-semibold text-[#4a351f] mb-4">Quick links</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {actions.map((action) =>
            action.href ? (
              <a
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl border border-[#eadfce] bg-[#fffaf2] text-center hover:bg-[#f8efdf] transition-colors"
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-[#f2dfbf] flex items-center justify-center text-xl">
                  <span>{action.icon}</span>
                </div>
                <p className="font-medium text-[#5f4527] text-sm">{action.label}</p>
              </a>
            ) : (
              <Link key={action.label} to={action.to} className="p-4 rounded-xl border border-[#eadfce] bg-[#fffaf2] text-center hover:bg-[#f8efdf] transition-colors">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-[#f2dfbf] flex items-center justify-center text-xl">
                  <span>{action.icon}</span>
                </div>
                <p className="font-medium text-[#5f4527] text-sm">{action.label}</p>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

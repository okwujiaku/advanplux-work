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
      <div className="bg-[#1B4965] rounded-xl text-white p-6 shadow-lg border border-[#2b607f]">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-white/80">Today earnings</p>
            <p className="text-3xl font-bold mt-1">${earnedTodayUsd}</p>
            <p className="text-sm text-white/80 mt-2">
              {packInfo ? `${packInfo.planName} · ${packInfo.adsPerDay} ads/day` : 'No package activated yet'}
            </p>
          </div>
          <div className="sm:border-l sm:border-[#2b607f] sm:pl-6">
            <p className="text-3xl font-bold mt-1">${Number(walletUsd || 0).toFixed(2)}</p>
            <p className="text-sm text-white/80 mt-2">Total earnings available for withdrawal</p>
          </div>
        </div>
      </div>

      <div className="bg-[#e8f3fb] rounded-xl border border-[#9dc4de] px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p key={bannerIndex} className="text-sm sm:text-base font-medium text-[#143D59] transition-all duration-500">
            {bannerMessages[bannerIndex]}
          </p>
          <div className="flex items-center gap-1.5">
            {bannerMessages.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === bannerIndex ? 'w-5 bg-primary-500' : 'w-1.5 bg-[#7ca7c6]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#1B4965] rounded-xl border border-[#2b607f] p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4">Quick links</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {actions.map((action) =>
            action.href ? (
              <a
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl border border-[#2b607f] bg-[#143D59] text-center hover:bg-[#1F5A82] transition-colors"
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary-500/20 flex items-center justify-center text-xl">
                  <span>{action.icon}</span>
                </div>
                <p className="font-medium text-white text-sm">{action.label}</p>
              </a>
            ) : (
              <Link key={action.label} to={action.to} className="p-4 rounded-xl border border-[#2b607f] bg-[#143D59] text-center hover:bg-[#1F5A82] transition-colors">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary-500/20 flex items-center justify-center text-xl">
                  <span>{action.icon}</span>
                </div>
                <p className="font-medium text-white text-sm">{action.label}</p>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

import { useEffect, useState } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ThemeToggle from '../components/ThemeToggle'

const COMMUNITY_WHATSAPP_URL = 'https://chat.whatsapp.com/I8YAAMLwMv43dv7OlholTA?mode=hq1tcla'

const navItems = [
  { to: '/dashboard', end: true, label: 'Home' },
  { to: '/dashboard/purchase', end: false, label: 'Purchase' },
  { to: '/dashboard/deposit', end: false, label: 'Deposit' },
  { to: '/dashboard/request-withdrawal', end: false, label: 'Withdrawal' },
  { to: '/dashboard/referral', end: false, label: 'Referral' },
  { to: '/dashboard/team', end: false, label: 'Weekly Salary' },
]

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showCommunityPopup, setShowCommunityPopup] = useState(() =>
    typeof window !== 'undefined' && window.sessionStorage.getItem('showCommunityPopupAfterSignup') === '1'
  )
  const { signOut, refetchWalletAndDeposits } = useApp()
  const location = useLocation()

  const closeCommunityPopup = () => {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem('showCommunityPopupAfterSignup')
    setShowCommunityPopup(false)
  }

  // Refetch balance when dashboard is shown or user returns to tab (e.g. after admin approves a deposit)
  useEffect(() => {
    refetchWalletAndDeposits?.()
  }, [refetchWalletAndDeposits])
  useEffect(() => {
    const onFocus = () => refetchWalletAndDeposits?.()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refetchWalletAndDeposits])
  // Auto-refresh balance every 15s so approved deposits show without user action
  useEffect(() => {
    const interval = setInterval(() => refetchWalletAndDeposits?.(), 15000)
    return () => clearInterval(interval)
  }, [refetchWalletAndDeposits])
  const menuItems = [
    { label: 'My profile', to: '/dashboard/profile' },
    { label: 'Withdrawal details', to: '/dashboard/withdrawal' },
    { label: 'Earning history', to: '/dashboard/earning-history' },
    { label: 'Deposit history', to: '/dashboard/deposit-history' },
    { label: 'Withdrawal history', to: '/dashboard/withdrawal-history' },
    { label: 'Change password', to: '/dashboard/change-password' },
    { label: 'Logout', to: '/' },
  ]

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#eef4ff_0%,#ffffff_45%,#f5f9ff_100%)] dark:bg-[#0a0f1a]">
      <header className="bg-white/95 dark:bg-gray-800/95 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2 space-y-2 sm:space-y-0 sm:flex sm:justify-between sm:items-center sm:h-14 sm:py-0">
            <div className="flex items-center justify-between gap-2">
              <Link to="/" className="text-xl font-bold text-slate-900 dark:text-white">
                Advanplux
              </Link>
              <span className="text-slate-500 dark:text-gray-400 text-sm hidden sm:inline">Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => signOut()}
                className="inline-flex px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => {
                    if (item.label === 'Logout') signOut()
                    setMenuOpen(false)
                  }}
                  className="px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-gray-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 min-h-[calc(100vh-3.5rem)] shadow-sm flex flex-col">
          <nav className="p-4 space-y-1 flex-1">
            {navItems.map(({ to, end, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_100%)] text-white shadow-md'
                      : 'text-slate-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-gray-700'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => signOut()}
              className="w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 border border-slate-200 dark:border-gray-600"
            >
              Logout
            </button>
          </div>
        </aside>
        <main className="flex-1 p-4 pb-32 md:p-6 md:pb-6 lg:px-8 bg-transparent dark:bg-[#0a0f1a]">
          <Outlet />
        </main>
      </div>

      {/* Popup: Join our official community – shown when landing on dashboard after first-time sign up */}
      {showCommunityPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60" aria-modal="true" role="dialog">
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-600 shadow-xl p-6">
            <button
              type="button"
              onClick={closeCommunityPopup}
              className="absolute top-3 right-3 p-1.5 rounded-full text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-700 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white pr-8">Join our official community</h2>
            <p className="text-slate-600 dark:text-gray-300 mt-2 text-sm">Connect with other members and get updates.</p>
            <a
              href={COMMUNITY_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeCommunityPopup}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold shadow-lg"
            >
              <span>WhatsApp Group</span>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h.004a3.44 3.44 0 0 1-2.88-1.778l-.722-1.2-2.238.587.596-2.14-1.258-1.317a3.44 3.44 0 0 1-.53-1.8 3.48 3.48 0 0 1 3.47-3.47 3.44 3.44 0 0 1 2.43 1.004 3.44 3.44 0 0 1 1.013 2.43 3.47 3.47 0 0 1-3.474 3.474z" />
              </svg>
            </a>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-3 text-center">You can close this to use your dashboard.</p>
          </div>
        </div>
      )}

      {/* Mobile bottom nav – main has pb-32 so content never sits under this */}
      <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-lg z-40">
        <div className="grid grid-cols-3 text-center">
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-medium text-slate-800 dark:text-gray-200">Home</Link>
          <Link to="/dashboard/watch" onClick={() => setMenuOpen(false)} className="py-3 text-xs font-medium text-slate-700 dark:text-gray-300 px-2">Watch Ads and get paid</Link>
          <button type="button" onClick={() => setMenuOpen((prev) => !prev)} className="py-3 text-sm font-medium text-slate-700 dark:text-gray-300">Menu</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

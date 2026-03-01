import { useEffect, useState } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/dashboard', end: true, label: 'Home' },
  { to: '/dashboard/purchase', end: false, label: 'Purchase' },
  { to: '/dashboard/deposit', end: false, label: 'Deposit' },
  { to: '/dashboard/request-withdrawal', end: false, label: 'Withdrawal' },
  { to: '/dashboard/referral', end: false, label: 'Referral' },
  { to: '/dashboard/team', end: false, label: 'Team' },
]

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { signOut, refetchWalletAndDeposits } = useApp()
  const location = useLocation()

  // Refetch balance when dashboard is shown or user returns to tab (e.g. after admin approves a deposit)
  useEffect(() => {
    refetchWalletAndDeposits?.()
  }, [refetchWalletAndDeposits])
  useEffect(() => {
    const onFocus = () => refetchWalletAndDeposits?.()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refetchWalletAndDeposits])
  // Periodic refetch so approved deposits show in Total balance without refresh
  useEffect(() => {
    const interval = setInterval(() => refetchWalletAndDeposits?.(), 45000)
    return () => clearInterval(interval)
  }, [refetchWalletAndDeposits])
  const menuItems = [
    { label: 'My profile', to: '/dashboard/profile' },
    { label: 'Create withdrawal PIN', to: '/dashboard/withdrawal-pin' },
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#eef4ff_0%,#ffffff_45%,#f5f9ff_100%)]">
      <header className="bg-white/95 border-b border-slate-200 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2 space-y-2 sm:space-y-0 sm:flex sm:justify-between sm:items-center sm:h-14 sm:py-0">
            <div className="flex items-center justify-between gap-2">
              <Link to="/" className="text-xl font-bold text-slate-900">
                Advanplux
              </Link>
              <span className="text-slate-500 text-sm hidden sm:inline">Dashboard</span>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => {
                    if (item.label === 'Logout') signOut()
                    setMenuOpen(false)
                  }}
                  className="px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-sky-50"
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
        <aside className="hidden md:block w-64 flex-shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-3.5rem)] shadow-sm flex flex-col">
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
                      : 'text-slate-700 hover:bg-sky-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => signOut()}
              className="w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 border border-slate-200"
            >
              Logout
            </button>
          </div>
        </aside>
        <main className="flex-1 p-4 pb-32 md:p-6 md:pb-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav – main has pb-32 so content never sits under this */}
      <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] bg-white border border-slate-200 rounded-2xl shadow-lg z-40">
        <div className="grid grid-cols-3 text-center">
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-medium text-slate-800">Home</Link>
          <Link to="/dashboard/watch" onClick={() => setMenuOpen(false)} className="py-3 text-xs font-medium text-slate-700 px-2">Watch Ads and get paid</Link>
          <button type="button" onClick={() => setMenuOpen((prev) => !prev)} className="py-3 text-sm font-medium text-slate-700">Menu</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

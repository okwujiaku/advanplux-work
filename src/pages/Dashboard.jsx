import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/dashboard', end: true, label: 'Home' },
  { to: '/dashboard/purchase', end: false, label: 'Purchase' },
  { to: '/dashboard/deposit', end: false, label: 'Deposit' },
  { to: '/dashboard/withdrawal', end: false, label: 'Withdrawal' },
  { to: '/dashboard/referral', end: false, label: 'Referral' },
  { to: '/dashboard/team', end: false, label: 'Team' },
]

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { signOut } = useApp()
  const menuItems = [
    { label: 'My profile', to: '/dashboard' },
    { label: 'Add withdrawal details', to: '/dashboard/withdrawal' },
    { label: 'My withdrawal details', to: '/dashboard/withdrawal' },
    { label: 'Earning history', to: '/dashboard/watch' },
    { label: 'Deposit history', to: '/dashboard/deposit' },
    { label: 'Withdrawal history', to: '/dashboard/withdrawal' },
    { label: 'Change password', to: '/dashboard/change-password' },
    { label: 'Logout', to: '/' },
  ]

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
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
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
        <aside className="hidden md:block w-64 flex-shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-3.5rem)] shadow-sm">
          <nav className="p-4 space-y-1">
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
        </aside>
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] bg-white border border-slate-200 rounded-2xl shadow-lg z-40">
        <div className="grid grid-cols-3 text-center">
          <Link to="/dashboard" className="py-3 text-sm font-medium text-slate-800">Home</Link>
          <Link to="/dashboard/watch" className="py-3 text-xs font-medium text-slate-700 px-2">Watch Ads and get paid</Link>
          <button type="button" onClick={() => setMenuOpen((prev) => !prev)} className="py-3 text-sm font-medium text-slate-700">Menu</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

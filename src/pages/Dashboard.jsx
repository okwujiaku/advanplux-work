import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'

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
  const menuItems = [
    { label: 'My profile', to: '/dashboard' },
    { label: 'Add withdrawal details', to: '/dashboard/withdrawal' },
    { label: 'My withdrawal details', to: '/dashboard/withdrawal' },
    { label: 'Earning history', to: '/dashboard/watch' },
    { label: 'Deposit history', to: '/dashboard/deposit' },
    { label: 'Withdrawal history', to: '/dashboard/withdrawal' },
    { label: 'Change password', to: '/dashboard/change-password' },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#fff7e8_0%,#fffdf6_45%,#f8f3e9_100%)]">
      <header className="bg-[#fff7e8]/95 border-b border-[#e8dcc8] sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2 space-y-2 sm:space-y-0 sm:flex sm:justify-between sm:items-center sm:h-14 sm:py-0">
            <div className="flex items-center justify-between gap-2">
              <Link to="/" className="text-xl font-bold text-[#7d5b2f]">
                Advanplux
              </Link>
              <span className="text-[#a77d4a] text-sm hidden sm:inline">Dashboard</span>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-[#e8dcc8] bg-[#fff8ec]">
            <div className="max-w-7xl mx-auto px-4 py-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm text-[#6f522c] hover:bg-[#f4e8d5]"
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
        <aside className="hidden md:block w-64 flex-shrink-0 bg-[linear-gradient(180deg,#fff8ec_0%,#f5ebda_100%)] border-r border-[#e8dcc8] min-h-[calc(100vh-3.5rem)]">
          <nav className="p-4 space-y-1">
            {navItems.map(({ to, end, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-[#dcb175] text-[#3f2b16]' : 'text-[#6f522c] hover:bg-[#f2e4ce]'
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
      <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] bg-[#fff8ec] border border-[#e8dcc8] rounded-2xl shadow-lg z-40">
        <div className="grid grid-cols-3 text-center">
          <Link to="/dashboard" className="py-3 text-sm font-medium text-[#6f522c]">Home</Link>
          <Link to="/dashboard/watch" className="py-3 text-xs font-medium text-[#6f522c]/90 px-2">Watch Ads and get paid</Link>
          <button type="button" onClick={() => setMenuOpen((prev) => !prev)} className="py-3 text-sm font-medium text-[#6f522c]/90">Menu</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

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
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef5fb_0%,#dfeaf4_100%)]">
      <header className="bg-[#143D59] border-b border-[#1B4965] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2 space-y-2 sm:space-y-0 sm:flex sm:justify-between sm:items-center sm:h-14 sm:py-0">
            <div className="flex items-center justify-between gap-2">
              <Link to="/" className="text-xl font-bold text-white">
                Advanplux
              </Link>
              <span className="text-white/70 text-sm hidden sm:inline">Dashboard</span>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-[#1B4965] bg-[#143D59]">
            <div className="max-w-7xl mx-auto px-4 py-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm text-white/90 hover:bg-white/10"
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
        <aside className="hidden md:block w-64 flex-shrink-0 bg-[#143D59] border-r border-[#1B4965] min-h-[calc(100vh-3.5rem)]">
          <nav className="p-4 space-y-1">
            {navItems.map(({ to, end, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-500 text-white' : 'text-white/80 hover:bg-white/10'
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
      <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] bg-[#143D59] border border-[#1B4965] rounded-2xl shadow-lg z-40">
        <div className="grid grid-cols-3 text-center">
          <Link to="/dashboard" className="py-3 text-sm font-medium text-white">Home</Link>
          <Link to="/dashboard/watch" className="py-3 text-xs font-medium text-white/90 px-2">Watch Ads and get paid</Link>
          <button type="button" onClick={() => setMenuOpen((prev) => !prev)} className="py-3 text-sm font-medium text-white/90">Menu</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

import { useState } from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-[#143D59] border-b border-[#1B4965] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-white">
              Advanplux
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#home" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </a>
              <a href="#watch-ads" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Watch Ads
              </a>
              <a href="#referrals" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Referrals
              </a>
              <a href="#team" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Team Earnings
              </a>
              <a href="#activities" className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Activities
              </a>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/dashboard" className="text-white/90 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Login
            </Link>
            <Link to="/dashboard" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors shadow-md">
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white/90 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#143D59] border-t border-[#1B4965]">
            <a href="#home" className="text-white/90 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Home
            </a>
            <a href="#watch-ads" className="text-white/90 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Watch Ads
            </a>
            <a href="#referrals" className="text-white/90 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Referrals
            </a>
            <a href="#team" className="text-white/90 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Team Earnings
            </a>
            <a href="#activities" className="text-white/90 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Activities
            </a>
            <div className="pt-4 pb-3 border-t border-[#1B4965]">
              <Link to="/dashboard" className="text-white/90 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Login
              </Link>
              <Link to="/dashboard" className="bg-primary-500 hover:bg-primary-600 text-white block px-3 py-2 rounded-md text-base font-medium mt-2 text-center">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

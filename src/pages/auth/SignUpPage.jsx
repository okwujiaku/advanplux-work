import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import ThemeToggle from '../../components/ThemeToggle'

function Icon({ type }) {
  const cls = 'w-4 h-4 text-slate-500 dark:text-gray-400'
  if (type === 'phone') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.08 4.18 2 2 0 0 1 5.06 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.65 2.62a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 5 5l1.46-1.17a2 2 0 0 1 2.11-.45c.84.31 1.72.53 2.62.65A2 2 0 0 1 22 16.92z" />
      </svg>
    )
  }
  if (type === 'mail') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    )
  }
  if (type === 'lock') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 1 1 8 0v4" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

function SignUpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp } = useApp()
  const initialInviteCode = new URLSearchParams(location.search).get('invite') || ''
  const [form, setForm] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    invitationCode: initialInviteCode,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const result = await signUp(form)
    if (!result.ok) {
      setError(result.error)
      return
    }
    // Popup shows on dashboard after redirect (GuestOnly sends authenticated users to dashboard)
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('showCommunityPopupAfterSignup', '1')
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#143D59_0%,#1B4965_100%)] dark:bg-[linear-gradient(135deg,#0f2d42_0%,#143652_100%)] px-4 py-6 flex items-center justify-center relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-5 text-white">
          <p className="text-4xl sm:text-5xl font-bold tracking-tight">Advanplux</p>
          <p className="text-lg sm:text-xl text-white/90 mt-1.5">Watch ads and get paid</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-gray-700 shadow-xl p-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sign Up</h1>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-sm">
              <Icon type="phone" />
              <input
                type="tel"
                value={form.phone}
                onChange={handleChange('phone')}
                placeholder="Phone number"
                className="w-full outline-none text-slate-700 dark:text-gray-200 placeholder:text-slate-400 dark:placeholder:text-gray-500 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-sm">
              <Icon type="mail" />
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="Email"
                className="w-full outline-none text-slate-700 dark:text-gray-200 placeholder:text-slate-400 dark:placeholder:text-gray-500 bg-transparent"
              />
            </div>
            <div className="relative flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-sm">
              <Icon type="lock" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Create password"
                className="w-full outline-none text-slate-700 dark:text-gray-200 placeholder:text-slate-400 dark:placeholder:text-gray-500 bg-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 p-1 rounded text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <div className="relative flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-sm">
              <Icon type="lock" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="Confirm password"
                className="w-full outline-none text-slate-700 dark:text-gray-200 placeholder:text-slate-400 dark:placeholder:text-gray-500 bg-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 p-1 rounded text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 focus:outline-none"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-sm">
              <Icon type="user" />
              <input
                type="text"
                value={form.invitationCode}
                onChange={handleChange('invitationCode')}
                placeholder="Invitation code"
                className="w-full outline-none text-slate-700 dark:text-gray-200 placeholder:text-slate-400 dark:placeholder:text-gray-500 bg-transparent"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[linear-gradient(135deg,#143D59_0%,#1B4965_100%)] hover:opacity-95 text-white font-semibold shadow-lg"
            >
              Sign Up
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-5 text-center">
            Already Signed Up?{' '}
            <Link to="/sign-in" className="text-[#126c44] dark:text-primary-400 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage

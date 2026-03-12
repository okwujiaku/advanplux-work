import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import ThemeToggle from '../../components/ThemeToggle'

function Icon({ type }) {
  const cls = 'w-4 h-4 text-slate-500 dark:text-gray-400'
  if (type === 'user') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  )
}

function SignInPage() {
  const navigate = useNavigate()
  const { signIn } = useApp()
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const result = await signIn({ emailOrPhone, password })
    if (!result.ok) {
      setError(result.error)
      return
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sign In</h1>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-sm bg-transparent">
              <Icon type="user" />
              <input
                type="text"
                value={emailOrPhone}
                onChange={(event) => setEmailOrPhone(event.target.value)}
                placeholder="Email or phone number"
                className="w-full outline-none text-slate-700 dark:text-gray-200 placeholder:text-slate-400 dark:placeholder:text-gray-500 bg-transparent"
              />
            </div>
            <div className="relative flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-sm bg-transparent">
              <Icon type="lock" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
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
            <div className="text-right -mt-1">
              <Link to="/forgot-password" className="text-xs font-semibold text-[#143D59] dark:text-primary-400 hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[linear-gradient(135deg,#143D59_0%,#1B4965_100%)] hover:opacity-95 text-white font-semibold shadow-lg"
            >
              Sign In
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-5 text-center">
            No account yet?{' '}
            <Link to="/sign-up" className="text-[#126c44] font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignInPage

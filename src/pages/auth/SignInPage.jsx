import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

function Icon({ type }) {
  const cls = 'w-4 h-4 text-slate-500'
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
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    const result = signIn({ emailOrPhone, password })
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#143D59_0%,#1B4965_100%)] px-4 py-6 flex items-center justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-5 text-white">
          <p className="text-3xl font-bold tracking-tight">Advanplux</p>
          <p className="text-sm text-white/85 mt-1">Watch ads and get paid</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6">
          <h1 className="text-3xl font-bold text-slate-900">Sign In</h1>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <Icon type="user" />
              <input
                type="text"
                value={emailOrPhone}
                onChange={(event) => setEmailOrPhone(event.target.value)}
                placeholder="Email or phone number"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <Icon type="lock" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="text-right -mt-1">
              <Link to="/forgot-password" className="text-xs font-semibold text-[#143D59] hover:underline">
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

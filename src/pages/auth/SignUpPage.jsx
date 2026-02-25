import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

function Icon({ type }) {
  const cls = 'w-4 h-4 text-slate-500'
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
  const [error, setError] = useState('')

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    const result = signUp(form)
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
          <h1 className="text-3xl font-bold text-slate-900">Sign Up</h1>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <Icon type="phone" />
              <input
                type="tel"
                value={form.phone}
                onChange={handleChange('phone')}
                placeholder="Phone number"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <Icon type="mail" />
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="Email"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <Icon type="lock" />
              <input
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Create password"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <Icon type="lock" />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="Confirm password"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <Icon type="user" />
              <input
                type="text"
                value={form.invitationCode}
                onChange={handleChange('invitationCode')}
                placeholder="Invitation code"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400"
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
            <Link to="/sign-in" className="text-[#126c44] font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage

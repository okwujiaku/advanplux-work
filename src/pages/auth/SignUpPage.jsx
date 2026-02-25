import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

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
    invitationCode: initialInviteCode.toUpperCase(),
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f2f5fa_0%,#ffffff_100%)] px-4 py-8 sm:py-10">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6">
          <h1 className="text-3xl font-bold text-slate-900">Sign Up</h1>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-slate-400">📱</span>
              <input
                type="tel"
                value={form.phone}
                onChange={handleChange('phone')}
                placeholder="Phone number"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-slate-400">✉️</span>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="Email"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-slate-400">🔒</span>
              <input
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Create password"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-slate-400">🔐</span>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="Confirm password"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-slate-400">👤</span>
              <input
                type="text"
                value={form.invitationCode}
                onChange={handleChange('invitationCode')}
                placeholder="Invitation code (optional)"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400 uppercase"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[linear-gradient(135deg,#063b24_0%,#0b4f30_55%,#126c44_100%)] hover:opacity-95 text-white font-semibold shadow-lg"
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

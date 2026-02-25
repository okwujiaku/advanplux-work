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
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_100%)] px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        <p className="text-sm text-slate-600 mt-1">Simple access signup. No email or code verification.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange('phone')}
            placeholder="Phone number"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
          />
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="Email"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
          />
          <input
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="Create password"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
          />
          <input
            type="password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            placeholder="Confirm password"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            value={form.invitationCode}
            onChange={handleChange('invitationCode')}
            placeholder="Invitation code (optional)"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg uppercase"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Create account
          </button>
        </form>

        <p className="text-sm text-slate-600 mt-4">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-blue-600 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUpPage

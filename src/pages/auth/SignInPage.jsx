import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f2f5fa_0%,#ffffff_100%)] px-4 py-8 sm:py-10">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6">
          <h1 className="text-3xl font-bold text-slate-900">Sign In</h1>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-slate-400">👤</span>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(event) => setEmailOrPhone(event.target.value)}
                placeholder="Email or phone number"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-slate-400">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="w-full outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[linear-gradient(135deg,#063b24_0%,#0b4f30_55%,#126c44_100%)] hover:opacity-95 text-white font-semibold shadow-lg"
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

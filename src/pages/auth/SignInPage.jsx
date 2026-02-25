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
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_100%)] px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-600 mt-1">Sign in with your email or phone and password.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            value={emailOrPhone}
            onChange={(event) => setEmailOrPhone(event.target.value)}
            placeholder="Email or phone number"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Sign in
          </button>
        </form>

        <p className="text-sm text-slate-600 mt-4">
          No account yet?{' '}
          <Link to="/sign-up" className="text-blue-600 font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignInPage

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { resetPassword } = useApp()
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    const result = resetPassword({ emailOrPhone, newPassword, confirmPassword })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSuccess('Password updated successfully. You can sign in now.')
    setTimeout(() => navigate('/sign-in'), 1200)
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#143D59_0%,#1B4965_100%)] px-4 py-6 flex items-center justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-5 text-white">
          <p className="text-3xl font-bold tracking-tight">Advanplux</p>
          <p className="text-sm text-white/85 mt-1">Watch ads and get paid</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6">
          <h1 className="text-3xl font-bold text-slate-900">Reset Password</h1>
          <p className="text-sm text-slate-500 mt-1">Use your email or phone number.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              value={emailOrPhone}
              onChange={(event) => setEmailOrPhone(event.target.value)}
              placeholder="Email or phone number"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm password"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[linear-gradient(135deg,#143D59_0%,#1B4965_100%)] hover:opacity-95 text-white font-semibold shadow-lg"
            >
              Update Password
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-5 text-center">
            Remember your password?{' '}
            <Link to="/sign-in" className="text-[#143D59] font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage

import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

function ResetPasswordWithTokenPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!token.trim()) {
      setError('Invalid reset link. Use the link from your email or request a new one from the forgot password page.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/confirm-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          newPassword,
          confirmPassword,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) {
        setSuccess(data.message || 'Password updated. You can sign in now.')
        setTimeout(() => navigate('/sign-in'), 1500)
      } else {
        setError(data?.error || 'Could not update password. The link may have expired — request a new one.')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token.trim()) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#143D59_0%,#1B4965_100%)] px-4 py-6 flex items-center justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-5 text-white">
            <p className="text-3xl font-bold tracking-tight">Advanplux</p>
            <p className="text-sm text-white/85 mt-1">Watch ads and get paid</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6">
            <h1 className="text-2xl font-bold text-slate-900">Invalid reset link</h1>
            <p className="text-sm text-slate-500 mt-2">
              This link is missing or invalid. Use the link from your email, or request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="mt-4 inline-block w-full py-3 rounded-2xl bg-[#143D59] text-white font-semibold text-center hover:opacity-95"
            >
              Forgot password
            </Link>
            <p className="text-sm text-slate-500 mt-4 text-center">
              <Link to="/sign-in" className="text-[#143D59] font-semibold">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#143D59_0%,#1B4965_100%)] px-4 py-6 flex items-center justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-5 text-white">
          <p className="text-3xl font-bold tracking-tight">Advanplux</p>
          <p className="text-sm text-white/85 mt-1">Watch ads and get paid</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6">
          <h1 className="text-3xl font-bold text-slate-900">Set new password</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your new password below. You’ll use it to sign in after this.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl"
              autoComplete="new-password"
              required
              minLength={6}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl"
              autoComplete="new-password"
              required
              minLength={6}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-[linear-gradient(135deg,#143D59_0%,#1B4965_100%)] hover:opacity-95 text-white font-semibold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating…' : 'Update password'}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-5 text-center">
            <Link to="/sign-in" className="text-[#143D59] font-semibold">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordWithTokenPage

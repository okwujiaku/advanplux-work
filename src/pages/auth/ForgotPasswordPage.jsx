import { useState } from 'react'
import { Link } from 'react-router-dom'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) {
        setSuccess(data.message || "If an account exists with this email, we've sent you a link to reset your password. Check your inbox and spam folder.")
        setEmail('')
      } else {
        setError(data?.error || 'Something went wrong. Try again later.')
      }
    } catch {
      setError('Something went wrong. Try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#143D59_0%,#1B4965_100%)] px-4 py-6 flex items-center justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-5 text-white">
          <p className="text-3xl font-bold tracking-tight">Advanplux</p>
          <p className="text-sm text-white/85 mt-1">Watch ads and get paid</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6">
          <h1 className="text-3xl font-bold text-slate-900">Forgot password?</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your account email.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl"
              autoComplete="email"
              required
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-[linear-gradient(135deg,#143D59_0%,#1B4965_100%)] hover:opacity-95 text-white font-semibold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending…' : 'Send reset link'}
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

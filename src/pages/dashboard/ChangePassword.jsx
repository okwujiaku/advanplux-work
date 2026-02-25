import { useState } from 'react'

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) return
    if (newPassword !== confirmPassword) {
      setMessage('New password and confirm password do not match.')
      return
    }
    // Placeholder user-side change password flow (non-admin).
    setMessage('Password update request submitted successfully.')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#143D59]">Change Password</h1>
        <p className="text-[#1B4965] mt-1">Update your account password securely.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1B4965] rounded-xl border border-[#2b607f] shadow-lg p-6 space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-2">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-[#2b607f] bg-[#143D59] text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-2">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-[#2b607f] bg-[#143D59] text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-2">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-[#2b607f] bg-[#143D59] text-white"
          />
        </div>
        <button type="submit" className="px-5 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          Save password
        </button>
        {message && <p className="text-sm text-green-300">{message}</p>}
      </form>
    </div>
  )
}

export default ChangePassword

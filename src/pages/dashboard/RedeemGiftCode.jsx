import { useState } from 'react'
import { useApp } from '../../context/AppContext'

function RedeemGiftCode() {
  const { refetchWalletAndDeposits } = useApp()
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRedeem = async () => {
    if (!code.trim()) return
    setLoading(true)
    setStatus('')
    try {
      const token = typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('authSessionToken')
      const res = await fetch('/api/user/redeem-gift-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) {
        setStatus(`Success! $${Number(data.creditedUsd).toFixed(2)} has been added to your balance.`)
        setCode('')
        refetchWalletAndDeposits?.()
      } else {
        setStatus(data?.error || 'Invalid or already redeemed code.')
      }
    } catch {
      setStatus('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#143D59]">Redeem Gift Code</h1>
        <p className="text-[#1B4965] mt-1">Enter your gift code to claim rewards on your account.</p>
      </div>

      <div className="bg-[#1B4965] rounded-xl border border-[#2b607f] shadow-lg p-6">
        <label className="block text-sm text-white/80 mb-2">Gift code</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. GIFT-AB12CD34"
            className="flex-1 px-4 py-3 rounded-lg border border-[#2b607f] bg-[#143D59] text-white placeholder:text-white/40"
          />
          <button
            type="button"
            onClick={handleRedeem}
            disabled={loading}
            className="px-5 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? 'Redeeming…' : 'Redeem'}
          </button>
        </div>
        {status && <p className={`text-sm mt-3 ${status.startsWith('Success') ? 'text-green-300' : 'text-amber-200'}`}>{status}</p>}
      </div>
    </div>
  )
}

export default RedeemGiftCode

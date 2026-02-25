import { useState } from 'react'

function RedeemGiftCode() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')

  const handleRedeem = () => {
    if (!code.trim()) return
    // Placeholder user-side redeem flow (non-admin).
    setStatus('Gift code submitted. If valid, your reward will be added to your account.')
    setCode('')
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
            className="px-5 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Redeem
          </button>
        </div>
        {status && <p className="text-sm text-green-300 mt-3">{status}</p>}
      </div>
    </div>
  )
}

export default RedeemGiftCode

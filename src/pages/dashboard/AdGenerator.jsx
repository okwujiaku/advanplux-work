import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const SOCIAL_PROOF = [
  { id: '****59364', pack: '$20', earning: '₦7,500', time: '2 min ago' },
  { id: '****88291', pack: '$50', earning: '₦15,000', time: '5 min ago' },
  { id: '****44102', pack: '$100', earning: '₦25,000', time: '8 min ago' },
]

function AdGenerator() {
  const { userPack, PACKS_USD } = useApp()
  const [proofIndex, setProofIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setProofIndex((i) => (i + 1) % SOCIAL_PROOF.length), 3500)
    return () => clearInterval(t)
  }, [])

  const hasPack = !!userPack

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#143D59]">Ads Engine</h1>
        <p className="text-[#1B4965] mt-1">
          Buy Ad Engine to unlock daily ads. Watch ads and get paid.
        </p>
      </div>

      {/* Social proof */}
      <div className="bg-[#1B4965] rounded-xl border border-[#2b607f] shadow-lg overflow-hidden">
        <div className="px-4 py-2 border-b border-[#2b607f] bg-[#143D59] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-white/90">Recent activity</span>
        </div>
        <div className="p-4 min-h-[72px] flex items-center">
          <div className="flex items-start gap-3 w-full">
            <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 text-primary-500 font-semibold text-sm">
              {SOCIAL_PROOF[proofIndex].id.slice(-2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm">
                <span className="font-medium">{SOCIAL_PROOF[proofIndex].id}</span>
                {' '}bought <strong>{SOCIAL_PROOF[proofIndex].pack}</strong> pack · making{' '}
                <strong className="text-primary-400">{SOCIAL_PROOF[proofIndex].earning}</strong> today
              </p>
              <p className="text-white/70 text-xs mt-0.5">{SOCIAL_PROOF[proofIndex].time}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 packs: USD primary, Naira/CFA as sub */}
      <div id="purchase-ads-engine">
        <h2 className="text-lg font-semibold text-[#143D59] mb-4">Choose your package</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PACKS_USD.map((pack) => {
            const isCurrent = userPack === pack.usd
            const isUpgrade = userPack && pack.usd > userPack
            const isBuy = !userPack || isUpgrade
            return (
              <div
                key={pack.usd}
                className={`relative bg-[#1B4965] rounded-xl border-2 p-5 shadow-lg ${
                  isCurrent ? 'border-primary-500' : 'border-[#2b607f]'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2 left-4 px-2 py-0.5 bg-primary-500 text-white text-xs font-medium rounded">
                    Current
                  </span>
                )}
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-white">${pack.usd}</p>
                  <p className="text-sm text-white/70">₦{pack.naira.toLocaleString()} / CFA {pack.cfa.toLocaleString()}</p>
                  <p className="text-xs text-primary-400 font-medium mt-2">{pack.planName}</p>
                  <p className="text-xs text-white/80 mt-1">{pack.adsPerDay} ads per day</p>
                </div>
                {isBuy ? (
                  <Link
                    to="/dashboard/deposit"
                    state={{ pack: pack.usd }}
                    className="block w-full py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 text-center"
                  >
                    {isUpgrade ? 'Upgrade' : 'Activate'}
                  </Link>
                ) : (
                  <button disabled className="w-full py-2.5 bg-white/20 text-white/70 rounded-lg font-medium cursor-not-allowed">
                    Active
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {!hasPack && (
        <p className="text-center text-[#1B4965] py-4">
          Buy Ad Engine above and complete deposit to start viewing ads.
        </p>
      )}
    </div>
  )
}

export default AdGenerator

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const USD_TO_NGN = 1450
const USD_TO_CFA = 600
const USD_TO_RWF = 1500
/** Packs that are locked: show "Locked" and disable activation. */
const LOCKED_PACKS_USD = [500, 1000]
const SOCIAL_PROOF = [
  { id: '****59364', pack: '$20', usd: 20, time: '2 min ago' },
  { id: '****88291', pack: '$50', usd: 50, time: '5 min ago' },
  { id: '****44102', pack: '$100', usd: 100, time: '8 min ago' },
]

function AdGenerator() {
  const { activePacks, PACKS_USD, walletUsd, activatePack } = useApp()
  const [proofIndex, setProofIndex] = useState(0)
  const [activating, setActivating] = useState(null)

  useEffect(() => {
    const t = setInterval(() => setProofIndex((i) => (i + 1) % SOCIAL_PROOF.length), 3500)
    return () => clearInterval(t)
  }, [])

  const hasPack = activePacks.length > 0
  const balance = Number(walletUsd || 0)

  const handleActivate = async (packUsd) => {
    if (balance < packUsd || activating) return
    setActivating(packUsd)
    try {
      await activatePack(packUsd)
    } finally {
      setActivating(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#143D59] dark:text-primary-400">Get Ads Engine</h1>
        <p className="text-[#1B4965] dark:text-gray-400 mt-1">
          Deposit to your balance, then activate a package below to unlock daily ads. Use Watch &amp; Earn to watch ads and get paid.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Your balance</p>
        <p className="text-2xl font-bold text-[#143D59] dark:text-primary-400">${balance.toFixed(2)}</p>
        <Link to="/dashboard/deposit" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-1 inline-block">Deposit funds →</Link>
      </div>

      {/* Social proof */}
      <div className="bg-[#1B4965] dark:bg-gray-800 rounded-xl border border-[#2b607f] dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="px-4 py-2 border-b border-[#2b607f] dark:border-gray-700 bg-[#143D59] dark:bg-gray-700/50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-white/90 dark:text-gray-300">Recent activity</span>
        </div>
        <div className="p-4 min-h-[72px] flex items-center">
          <div className="flex items-start gap-3 w-full">
            <div className="w-9 h-9 rounded-full bg-primary-500/20 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 text-primary-500 dark:text-primary-400 font-semibold text-sm">
              {SOCIAL_PROOF[proofIndex].id.slice(-2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white dark:text-gray-200 text-sm">
                <span className="font-medium">{SOCIAL_PROOF[proofIndex].id}</span>
                {' '}bought <strong>{SOCIAL_PROOF[proofIndex].pack}</strong> pack ·{' '}
                <strong className="text-primary-400 dark:text-primary-300">
                  ₦{(SOCIAL_PROOF[proofIndex].usd * USD_TO_NGN).toLocaleString()} / CFA {(SOCIAL_PROOF[proofIndex].usd * USD_TO_CFA).toLocaleString()} / RWF {(SOCIAL_PROOF[proofIndex].usd * USD_TO_RWF).toLocaleString()}
                </strong>
              </p>
              <p className="text-white/70 dark:text-gray-500 text-xs mt-0.5">{SOCIAL_PROOF[proofIndex].time}</p>
            </div>
          </div>
        </div>
      </div>

      <div id="purchase-ads-engine">
        <h2 className="text-lg font-semibold text-[#143D59] dark:text-white mb-2">Activate Ads Engine from your balance</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The Ads Engine expires after 90 days.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PACKS_USD.map((pack) => {
            const isLocked = LOCKED_PACKS_USD.includes(pack.usd)
            const activeCount = (activePacks || []).filter((p) => p === pack.usd).length
            const isActive = activeCount > 0
            const canActivate = !isLocked && balance >= pack.usd
            const insufficient = !isLocked && balance < pack.usd
            return (
              <div
                key={pack.usd}
                className={`relative bg-[#1B4965] dark:bg-gray-800 rounded-xl border-2 p-5 shadow-lg ${
                  isActive ? 'border-primary-500 dark:border-primary-600' : 'border-[#2b607f] dark:border-gray-600'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-2 left-4 px-2 py-0.5 bg-primary-500 text-white text-xs font-medium rounded">
                    Active{activeCount > 1 ? ` (${activeCount})` : ''}
                  </span>
                )}
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-white dark:text-gray-100">${pack.usd}</p>
                  <p className="text-sm text-white/70 dark:text-gray-400">₦{pack.naira.toLocaleString()} / CFA {pack.cfa.toLocaleString()} / RWF {(pack.rwf || 0).toLocaleString()}</p>
                  <p className="text-xs text-primary-400 dark:text-primary-300 font-medium mt-2">{pack.planName}</p>
                  <p className="text-xs text-white/80 dark:text-gray-400 mt-1">{pack.adsPerDay === 1 ? '1 ad per day' : `${pack.adsPerDay} ads per day`}</p>
                </div>
                {isLocked ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 bg-gray-500 dark:bg-gray-600 text-white dark:text-gray-300 rounded-lg font-medium cursor-not-allowed opacity-80"
                  >
                    Locked
                  </button>
                ) : canActivate ? (
                  <button
                    type="button"
                    onClick={() => handleActivate(pack.usd)}
                    disabled={!!activating}
                    className="w-full py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50"
                  >
                    {activating === pack.usd ? 'Activating…' : isActive ? 'Add another' : 'Activate'}
                  </button>
                ) : insufficient ? (
                  <div className="text-center">
                    <p className="text-xs text-white/70 dark:text-gray-400 mb-2">Need ${Math.max(0, (pack.usd - balance).toFixed(2))} more</p>
                    <Link
                      to="/dashboard/deposit"
                      className="block w-full py-2.5 bg-white/20 dark:bg-gray-600 text-white dark:text-gray-200 rounded-lg font-medium hover:bg-white/30 dark:hover:bg-gray-500 text-center"
                    >
                      Deposit
                    </Link>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      {!hasPack && (
        <p className="text-center text-[#1B4965] dark:text-gray-400 py-4">
          Deposit funds, then activate a package above. After activating, go to <Link to="/dashboard/watch" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">Watch &amp; Earn</Link> to watch ads and earn.
        </p>
      )}
    </div>
  )
}

export default AdGenerator

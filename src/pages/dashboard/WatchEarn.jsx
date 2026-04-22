import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const EARN_PER_AD_USD = 0.4
const REQUIRED_WATCH_SECONDS = 30
const DAY_MS = 24 * 60 * 60 * 1000

const PAY_AUTO_COUNTRIES = [
  { id: 'nigeria', name: 'Nigeria', currency: 'NGN', paymentType: 'Bank Account', ready: true },
  { id: 'cameroon', name: 'Cameroon', currency: 'CFA', paymentType: 'Mobile Money', ready: true },
  { id: 'rwanda', name: 'Rwanda', currency: 'RWF', paymentType: 'Mobile Money', ready: true },
]
const USD_TO_NGN = 1450
const USD_TO_CFA = 600
const USD_TO_RWF = 1500
const WATCH_AUTO_PAY_USD = 10
const CAMEROON_MOMO_DISPLAY = '670476375'
const RWANDA_MOMO_DISPLAY = '0787710293'

function getLatestWatchEarnAutoAddon(deposits) {
  const rows = (deposits || []).filter(
    (d) => d && (d.pack === 'watch_earn_auto' || d.paymentType === 'watch_earn_auto'),
  )
  const sorted = [...rows].sort((a, b) => {
    const ta = new Date(a.date || a.approvedAt || 0).getTime()
    const tb = new Date(b.date || b.approvedAt || 0).getTime()
    if (Number.isFinite(ta) && Number.isFinite(tb) && tb !== ta) return tb - ta
    return String(b.id || '').localeCompare(String(a.id || ''))
  })
  const latest = sorted[0]
  if (!latest) return { status: 'none', deposit: null }
  const st = String(latest.status || '').toLowerCase()
  if (st === 'pending') return { status: 'pending', deposit: latest }
  if (st === 'approved') return { status: 'approved', deposit: latest }
  if (st === 'rejected') return { status: 'rejected', deposit: latest }
  return { status: 'none', deposit: null }
}

function isYouTubeUrl(link) {
  const value = String(link || '').toLowerCase()
  return value.includes('youtube.com') || value.includes('youtu.be')
}

function getYoutubeVideoId(link) {
  const value = String(link || '').trim()
  if (!value) return ''
  if (value.includes('/shorts/')) return value.split('/shorts/')[1]?.split(/[?&/]/)[0] || ''
  if (value.includes('/embed/')) return value.split('/embed/')[1]?.split(/[?&/]/)[0] || ''
  if (value.includes('youtu.be/')) return value.split('youtu.be/')[1]?.split(/[?&]/)[0] || ''
  try {
    const url = new URL(value)
    return url.searchParams.get('v') || ''
  } catch {
    return ''
  }
}

function getYoutubeEmbedUrl(link) {
  const videoId = getYoutubeVideoId(link)
  return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : ''
}

function WatchEarn() {
  const app = useApp()
  const activePacks = app?.activePacks ?? []
  const PACKS_USD = app?.PACKS_USD ?? []
  const adsViewedToday = app?.adsViewedToday ?? 0
  const watchAd = app?.watchAd
  const runAutoAdsTask = app?.runAutoAdsTask
  const isAdminLoggedIn = app?.isAdminLoggedIn
  const freeAccessForSetup = app?.freeAccessForSetup
  const adVideoIds = app?.adVideoIds
  const earningsHistory = app?.earningsHistory ?? []
  const refetchWalletAndDeposits = app?.refetchWalletAndDeposits
  const deposits = app?.deposits ?? []
  const addDeposit = app?.addDeposit

  const [lastEarned, setLastEarned] = useState(null)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [countdown, setCountdown] = useState(REQUIRED_WATCH_SECONDS)
  const [timerRunning, setTimerRunning] = useState(false)
  const [canClaim, setCanClaim] = useState(false)
  const [playerMessage, setPlayerMessage] = useState('Click play on the video to start.')
  const lastCreditedAdKeyRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const countdownRef = useRef(REQUIRED_WATCH_SECONDS)
  const adsViewedTodayRef = useRef(0)
  const dailyLimitRef = useRef(0)
  const timerStartedForAdRef = useRef(null)
  const claimIdRef = useRef('')
  const playerRef = useRef(null)
  const startTimerRef = useRef(null)
  const stopTimerRef = useRef(null)
  const currentAdKeyRef = useRef(null)
  const fallbackAutoStartedForAdRef = useRef(null)
  const [ytReady, setYtReady] = useState(false)
  const [ytApiFailed, setYtApiFailed] = useState(false)
  const [fallbackMode, setFallbackMode] = useState(false)
  const [showFallbackManualHelp, setShowFallbackManualHelp] = useState(false)
  const [resetCountdown, setResetCountdown] = useState('')
  const [autoTaskRunning, setAutoTaskRunning] = useState(false)
  const [watchEarnLocked, setWatchEarnLocked] = useState(false)
  const [watchEarnSundayLockEnabled, setWatchEarnSundayLockEnabled] = useState(false)
  const [payAutoPanelOpen, setPayAutoPanelOpen] = useState(false)
  const [payAutoCountry, setPayAutoCountry] = useState('')
  const [payAutoFullName, setPayAutoFullName] = useState('')
  const [platformBankAccounts, setPlatformBankAccounts] = useState([])
  const [selectedPayAutoAccountId, setSelectedPayAutoAccountId] = useState('')
  const [payAutoCopiedField, setPayAutoCopiedField] = useState('')
  const [payAutoError, setPayAutoError] = useState('')
  const [payAutoSubmitting, setPayAutoSubmitting] = useState(false)

  const hasAccess = !!(activePacks.length > 0 || isAdminLoggedIn || freeAccessForSetup)
  const dailyLimit = activePacks.length > 0
    ? activePacks.reduce((sum, packUsd) => sum + (PACKS_USD.find((p) => p.usd === packUsd)?.adsPerDay ?? 0), 0)
    : (freeAccessForSetup ? (PACKS_USD[0]?.adsPerDay ?? 0) : 0)
  const canUseAutoTask = dailyLimit >= 50
  const watchEarnAutoAddon = useMemo(() => getLatestWatchEarnAutoAddon(deposits), [deposits])
  const showPaidAutoPaySection = hasAccess && dailyLimit > 0 && dailyLimit < 50
  const packInfo = activePacks.length > 0 && PACKS_USD.length > 0
    ? PACKS_USD.find((p) => p.usd === activePacks[0])
    : null
  const setupLimit = PACKS_USD[0]?.adsPerDay ?? 0
  const watchAdsStats = useMemo(() => {
    if (!dailyLimit || !Array.isArray(earningsHistory) || earningsHistory.length === 0) {
      return { watchedLast24h: 0, nextAvailableTs: null }
    }
    const nowTs = Date.now()
    const watchAds = earningsHistory
      .filter((e) => e && e.source === 'watch-ads' && e.date)
      .map((e) => {
        const ts = new Date(e.date).getTime()
        return Number.isFinite(ts) ? ts : null
      })
      .filter((ts) => ts != null && nowTs - ts < DAY_MS)
      .sort((a, b) => a - b)
    const watchedLast24h = watchAds.length
    if (watchedLast24h < dailyLimit) {
      return { watchedLast24h, nextAvailableTs: null }
    }
    const lastAdTs = watchAds[watchedLast24h - 1]
    const nextAvailableTs = lastAdTs + DAY_MS
    return { watchedLast24h, nextAvailableTs }
  }, [earningsHistory, dailyLimit])
  const watchedLast24h = watchAdsStats.watchedLast24h
  const nextAvailableTs = watchAdsStats.nextAvailableTs
  const isLocked = dailyLimit > 0 && watchedLast24h >= dailyLimit
  const adsRemaining = isLocked
    ? 0
    : Math.max(0, (dailyLimit || 0) - Math.min(adsViewedToday || 0, dailyLimit || 0))
  const canRunPaidAutoTask =
    watchEarnAutoAddon.status === 'approved' && !canUseAutoTask && adsRemaining > 0

  const payAutoCountryConfig = PAY_AUTO_COUNTRIES.find((c) => c.id === payAutoCountry)
  const payAutoReady = !!payAutoCountryConfig?.ready
  const payAutoSelectedCurrency =
    payAutoCountry === 'nigeria' ? 'NGN' : payAutoCountry === 'cameroon' ? 'CFA' : payAutoCountry === 'rwanda' ? 'RWF' : ''
  const payAutoAvailableAccounts = useMemo(
    () => platformBankAccounts.filter((account) => account.currency === payAutoSelectedCurrency),
    [platformBankAccounts, payAutoSelectedCurrency],
  )
  const payAutoSelectedAccount =
    payAutoAvailableAccounts.find((a) => a.id === selectedPayAutoAccountId) ||
    payAutoAvailableAccounts[0] ||
    null
  const nairaPayAmount = Math.round(WATCH_AUTO_PAY_USD * USD_TO_NGN)
  const cfaPayAmount = Math.round(WATCH_AUTO_PAY_USD * USD_TO_CFA)
  const rwfPayAmount = Math.round(WATCH_AUTO_PAY_USD * USD_TO_RWF)

  useEffect(() => {
    setSelectedPayAutoAccountId(payAutoAvailableAccounts[0]?.id || '')
  }, [payAutoCountry, payAutoAvailableAccounts])

  useEffect(() => {
    if (!showPaidAutoPaySection) return
    const controller = new AbortController()
    const load = async () => {
      try {
        const response = await fetch('/api/platform-bank-accounts', { signal: controller.signal })
        const payload = await response.json()
        if (response.ok && payload?.ok && Array.isArray(payload.accounts)) {
          setPlatformBankAccounts(payload.accounts)
        }
      } catch {
        /* ignore */
      }
    }
    load()
    return () => controller.abort()
  }, [showPaidAutoPaySection])

  const totalEarnedToday = useMemo(() => {
    if (!Array.isArray(earningsHistory) || earningsHistory.length === 0) return 0
    const nowTs = Date.now()
    return earningsHistory
      .filter((e) => {
        if (!e || e.source !== 'watch-ads' || !e.date) return false
        const ts = new Date(e.date).getTime()
        return Number.isFinite(ts) && (nowTs - ts < DAY_MS)
      })
      .reduce((sum, e) => sum + (Number(e.amountUsd) || 0), 0)
  }, [earningsHistory])
  const youtubeAdLinks = Array.isArray(adVideoIds) ? adVideoIds.filter(isYouTubeUrl) : []
  const hasVideos = youtubeAdLinks.length > 0
  const currentAdLink = hasVideos ? youtubeAdLinks[currentAdIndex % youtubeAdLinks.length] : ''
  const currentAdKey = `${currentAdIndex}-${currentAdLink || 'none'}`
  const youtubeEmbedUrl = getYoutubeEmbedUrl(currentAdLink)
  const youtubeVideoId = getYoutubeVideoId(currentAdLink)
  currentAdKeyRef.current = currentAdKey

  useEffect(() => {
    countdownRef.current = countdown
  }, [countdown])

  useEffect(() => {
    adsViewedTodayRef.current = adsViewedToday
  }, [adsViewedToday])

  useEffect(() => {
    dailyLimitRef.current = dailyLimit
  }, [dailyLimit])

  // Refetch earnings when entering Watch & Earn so countdown is correct after logout/navigation
  useEffect(() => {
    if (refetchWalletAndDeposits) refetchWalletAndDeposits()
  }, [refetchWalletAndDeposits])

  useEffect(() => {
    let cancelled = false
    fetch('/api/watch-earn-lock')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d?.ok) return
        setWatchEarnLocked(!!d.locked)
        setWatchEarnSundayLockEnabled(!!d.sundayLockEnabled)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Countdown until next ads become available (24h from last ad; persists when user leaves/logs out)
  useEffect(() => {
    if (!isLocked || !nextAvailableTs) {
      setResetCountdown('')
      return
    }

    const update = () => {
      const diff = nextAvailableTs - Date.now()
      if (diff <= 0) {
        setResetCountdown('00:00:00')
        return
      }
      const hours = String(Math.floor(diff / 3600000)).padStart(2, '0')
      const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
      const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
      setResetCountdown(`${hours}:${minutes}:${seconds}`)
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [isLocked, nextAvailableTs])

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setTimerRunning(false)
  }
  stopTimerRef.current = stopTimer

  useEffect(() => {
    if (!hasAccess || adsRemaining <= 0 || !currentAdLink) return
    stopTimer()
    setCanClaim(false)
    setCountdown(REQUIRED_WATCH_SECONDS)
    setPlayerMessage('Click play on the video to start.')
    timerStartedForAdRef.current = null
    fallbackAutoStartedForAdRef.current = null
    setShowFallbackManualHelp(false)
    claimIdRef.current = ''
  }, [adsRemaining, currentAdKey, currentAdLink, hasAccess])

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [])

  // Load YouTube IFrame API once
  useEffect(() => {
    if (typeof window === 'undefined' || window.YT?.Player) {
      setYtReady(true)
      return
    }
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const check = setInterval(() => {
        if (window.YT?.Player) {
          setYtReady(true)
          clearInterval(check)
        }
      }, 100)
      return () => clearInterval(check)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScript = document.getElementsByTagName('script')[0]
    firstScript?.parentNode?.insertBefore(tag, firstScript)
    window.onYouTubeIframeAPIReady = () => setYtReady(true)
    return () => { window.onYouTubeIframeAPIReady = null }
  }, [])

  // Create or update YouTube player; timer starts only when user clicks play (PLAYING state)
  useEffect(() => {
    if (ytReady && !ytApiFailed) {
      setFallbackMode(false)
      return
    }
    const id = setTimeout(() => {
      if (!ytReady || ytApiFailed) setFallbackMode(true)
    }, 12000)
    return () => clearTimeout(id)
  }, [ytReady, ytApiFailed])

  // In fallback mode, auto-start timer once per ad so users don't need manual action.
  useEffect(() => {
    if (!fallbackMode || !hasVideos || adsRemaining <= 0 || timerRunning || canClaim) return
    const adKey = currentAdKeyRef.current
    if (fallbackAutoStartedForAdRef.current === adKey) return
    fallbackAutoStartedForAdRef.current = adKey
    setShowFallbackManualHelp(false)
    setPlayerMessage('Auto timer started in compatibility mode.')
    const id = setTimeout(() => {
      if (startTimerRef.current) startTimerRef.current()
    }, 1200)
    return () => clearTimeout(id)
  }, [fallbackMode, hasVideos, adsRemaining, timerRunning, canClaim])

  // Show manual help only if fallback auto-start still doesn't begin.
  useEffect(() => {
    if (!fallbackMode || !hasVideos || adsRemaining <= 0 || timerRunning || canClaim) {
      setShowFallbackManualHelp(false)
      return
    }
    const id = setTimeout(() => {
      if (!timerRunning && !canClaim) setShowFallbackManualHelp(true)
    }, 4500)
    return () => clearTimeout(id)
  }, [fallbackMode, hasVideos, adsRemaining, timerRunning, canClaim, currentAdKey])

  useEffect(() => {
    if (!ytReady || !youtubeVideoId || !hasVideos || adsRemaining <= 0) return
    if (typeof window === 'undefined' || !window.YT || !window.YT.Player) {
      setYtApiFailed(true)
      return
    }
    const container = document.getElementById('watch-earn-yt-player')
    if (!container) return

    const onStateChange = (event) => {
      if (!event) return
      if (event.data === 1) {
        const adKey = currentAdKeyRef.current
        if (timerStartedForAdRef.current !== adKey) timerStartedForAdRef.current = adKey
        if (startTimerRef.current) startTimerRef.current()
      }
      if (event.data === 2 && stopTimerRef.current) stopTimerRef.current()
    }

    if (playerRef.current?.loadVideoById) {
      try { playerRef.current.loadVideoById(youtubeVideoId) } catch { setYtApiFailed(true) }
      return
    }
    try {
      playerRef.current = new window.YT.Player('watch-earn-yt-player', {
        videoId: youtubeVideoId,
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1 },
        events: { onStateChange },
      })
      setYtApiFailed(false)
    } catch {
      playerRef.current = null
      setYtApiFailed(true)
    }
    return () => {
      if (playerRef.current?.destroy) {
        try { playerRef.current.destroy() } catch {}
        playerRef.current = null
      }
    }
  }, [ytReady, youtubeVideoId, hasVideos, adsRemaining])

  const claimAdReward = async (force = false) => {
    if (!force && !canClaim) return
    if (!hasVideos || !currentAdLink || adsViewedTodayRef.current >= dailyLimitRef.current) return
    if (lastCreditedAdKeyRef.current === currentAdKey) return

    lastCreditedAdKeyRef.current = currentAdKey
    const claimId = claimIdRef.current || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const result = typeof watchAd === 'function' ? await watchAd(claimId) : { ok: false, error: 'Watch service unavailable.' }
    if (!result?.ok) {
      if (String(result?.error || '').toLowerCase().includes('duplicate ad claim')) {
        // Request was retried but reward was already credited; continue flow without showing hard error.
        if (refetchWalletAndDeposits) refetchWalletAndDeposits()
        setCurrentAdIndex((prev) => prev + 1)
        stopTimer()
        setCanClaim(false)
        setCountdown(REQUIRED_WATCH_SECONDS)
        setPlayerMessage('Ad already credited. Loading next ad...')
        claimIdRef.current = ''
        return
      }
      lastCreditedAdKeyRef.current = null
      setPlayerMessage(result?.error || 'Could not credit this ad. Please try again.')
      setCanClaim(false)
      setCountdown(REQUIRED_WATCH_SECONDS)
      return
    }

    setLastEarned(Number(result?.earning?.amountUsd) || EARN_PER_AD_USD)
    setCurrentAdIndex((prev) => prev + 1)
    stopTimer()
    setCanClaim(false)
    setCountdown(REQUIRED_WATCH_SECONDS)
    setPlayerMessage('Ad completed. Loading next ad...')
    claimIdRef.current = ''
  }

  const startTimer = () => {
    if (timerRunning || canClaim) return
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    setTimerRunning(true)
    setPlayerMessage('Ads running.')
    if (!claimIdRef.current) {
      claimIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    }

    timerIntervalRef.current = setInterval(() => {
      const next = countdownRef.current - 1
      const safeNext = Math.max(0, next)
      setCountdown(safeNext)
      countdownRef.current = safeNext

      if (next <= 0) {
        stopTimer()
        setCanClaim(true)
        setPlayerMessage('Ad completed. Loading next ad...')
        void claimAdReward(true)
      }
    }, 1000)
  }
  startTimerRef.current = startTimer

  const handleCopyPayAuto = async (label, value) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setPayAutoCopiedField(label)
      setTimeout(() => setPayAutoCopiedField(''), 2000)
    } catch {
      /* ignore */
    }
  }

  const handleSubmitWatchAutoPay = async () => {
    if (!payAutoReady || !payAutoSelectedAccount || !payAutoFullName.trim() || !addDeposit) return
    if (payAutoSubmitting) return
    setPayAutoError('')
    setPayAutoSubmitting(true)
    try {
      const localAmount =
        payAutoCountry === 'nigeria' ? nairaPayAmount : payAutoCountry === 'cameroon' ? cfaPayAmount : rwfPayAmount
      const id = await addDeposit({
        userId: 'current-user',
        amount: localAmount,
        amountUsd: WATCH_AUTO_PAY_USD,
        currency: payAutoCountry === 'nigeria' ? 'NGN' : payAutoCountry === 'cameroon' ? 'CFA' : 'RWF',
        country: payAutoCountryConfig.name,
        paymentType: 'watch_earn_auto',
        accountNumber: payAutoSelectedAccount.accountNumber || '',
        accountName: payAutoFullName.trim(),
        bankName: payAutoSelectedAccount.bankName || '',
        accountUsed: payAutoSelectedAccount.accountNumber || '',
        saveDetail: false,
        pack: 'watch_earn_auto',
      })
      if (id) {
        setPayAutoFullName('')
        setPayAutoPanelOpen(false)
        if (refetchWalletAndDeposits) refetchWalletAndDeposits()
      } else {
        setPayAutoError('Could not submit payment notice. Please try again.')
      }
    } catch (err) {
      setPayAutoError(err?.message || 'Something went wrong.')
    }
    setPayAutoSubmitting(false)
  }

  const handleAutoTask = async () => {
    if (autoTaskRunning || adsRemaining <= 0) return
    if (!canUseAutoTask && watchEarnAutoAddon.status !== 'approved') return
    setAutoTaskRunning(true)
    const result = typeof runAutoAdsTask === 'function'
      ? await runAutoAdsTask()
      : { ok: false, error: 'Auto task service unavailable.' }
    if (!result?.ok) {
      setPlayerMessage(result?.error || 'Could not complete auto task.')
      setAutoTaskRunning(false)
      return
    }
    setLastEarned(Number(result?.creditedAmountUsd) || 0)
    setPlayerMessage(`Auto task completed: ${Number(result?.creditedCount) || 0} ads credited.`)
    if (refetchWalletAndDeposits) refetchWalletAndDeposits()
    setAutoTaskRunning(false)
  }

  if (!app) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-gray-600">Loading…</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active ads engine</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Activate an Ads Engine package from your balance to watch ads here and earn.
          </p>
          <Link
            to="/dashboard/purchase"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
          >
            Get Ads Engine
          </Link>
        </div>
      </div>
    )
  }

  if (watchEarnLocked) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Watch & Earn</h1>
            {activePacks.length > 0 && (
              <a
                href="https://chat.whatsapp.com/LyCzBdAgXo21CcEa8xSYOD?mode=gi_t"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs sm:text-sm font-medium hover:bg-primary-700 whitespace-nowrap"
              >
                Join Advanplux VIP
              </a>
            )}
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center">
          <p className="text-gray-900 dark:text-white font-semibold text-lg mb-2">Watch &amp; Earn temporarily unavailable</p>
          <p className="text-amber-800 dark:text-amber-300">
            {watchEarnSundayLockEnabled
              ? 'Watch & Earn task page is not available on Sundays. Please come back tomorrow.'
              : 'Watch & Earn is currently locked by admin. Please check back later.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Watch & Earn</h1>
          {activePacks.length > 0 && (
            <a
              href="https://chat.whatsapp.com/LyCzBdAgXo21CcEa8xSYOD?mode=gi_t"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs sm:text-sm font-medium hover:bg-primary-700 whitespace-nowrap"
            >
              Join Advanplux VIP
            </a>
          )}
        </div>
        {activePacks.length > 0 ? (
          <>
            <p className="text-primary-600 dark:text-primary-400 font-semibold mt-1">
              {activePacks.length === 1 && packInfo ? packInfo.planName : `${dailyLimit} ${dailyLimit === 1 ? 'ad' : 'ads'} per day from your active packs`}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {dailyLimit} {dailyLimit === 1 ? 'ad' : 'ads'} per day · ${EARN_PER_AD_USD.toFixed(2)} per completed ad. Watch the full {REQUIRED_WATCH_SECONDS}s to earn.
            </p>
          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Setup access mode active (preview: {setupLimit} {setupLimit === 1 ? 'ad' : 'ads'}/day). Earn ${EARN_PER_AD_USD.toFixed(2)} per completed ad.
          </p>
        )}
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ads left (24h)</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{adsRemaining} / {dailyLimit}</p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Earned (24h)</p>
          <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">${totalEarnedToday.toFixed(2)}</p>
        </div>
      </div>

      {showPaidAutoPaySection && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Pay $10 for auto-task (pending admin approval)
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            One-time add-on: after you pay and an admin approves, you can use Run Auto Task for your daily ad limit (same behavior
            as high-tier). When you send the transfer, use reference / purpose:{' '}
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">Watch Earn Auto</span>.
          </p>

          {watchEarnAutoAddon.status === 'pending' && (
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300">
              Payment submitted — waiting for admin approval. You&apos;ll be able to run auto-task once this payment is confirmed.
            </div>
          )}

          {watchEarnAutoAddon.status === 'approved' && (
            <div className="rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 p-4">
              <p className="text-sm font-medium text-teal-900 dark:text-teal-200">Paid auto-task unlocked</p>
              <p className="text-xs text-teal-800 dark:text-teal-300 mt-1">
                Tap once to auto-complete all remaining ads for this 24-hour cycle.
              </p>
              {adsRemaining > 0 ? (
                <button
                  type="button"
                  onClick={handleAutoTask}
                  disabled={autoTaskRunning}
                  className="mt-3 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {autoTaskRunning ? 'Completing task...' : 'Run Auto Task'}
                </button>
              ) : (
                <p className="text-xs text-teal-800 dark:text-teal-400 mt-2">
                  No ads left in this window. When your daily ads reset, use Run Auto Task here.
                </p>
              )}
            </div>
          )}

          {(watchEarnAutoAddon.status === 'none' || watchEarnAutoAddon.status === 'rejected') && (
            <div className="space-y-3">
              {watchEarnAutoAddon.status === 'rejected' && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  Your last Watch Earn Auto payment was not approved. You can submit a new payment below.
                </p>
              )}
              {!payAutoPanelOpen ? (
                <button
                  type="button"
                  onClick={() => setPayAutoPanelOpen(true)}
                  className="px-4 py-2 rounded-lg bg-slate-700 dark:bg-slate-600 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-500"
                >
                  Show payment details ($10)
                </button>
              ) : (
                <div className="space-y-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-gray-800 p-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Fixed amount: ${WATCH_AUTO_PAY_USD} USD</p>
                  <div>
                    <label htmlFor="pay-auto-country" className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Country / currency
                    </label>
                    <select
                      id="pay-auto-country"
                      value={payAutoCountry}
                      onChange={(e) => setPayAutoCountry(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                    >
                      <option value="">Select country / currency</option>
                      {PAY_AUTO_COUNTRIES.filter((c) => c.ready).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  {payAutoCountry === 'nigeria' && (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-3 text-sm text-gray-800 dark:text-gray-200">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nigeria — NGN</p>
                      <p>
                        Pay exactly: <span className="font-semibold">₦{nairaPayAmount.toLocaleString()}</span>
                      </p>
                    </div>
                  )}
                  {payAutoCountry === 'cameroon' && (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-3 text-sm text-gray-800 dark:text-gray-200">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cameroon — CFA</p>
                      <p>
                        Pay exactly: <span className="font-semibold">CFA {cfaPayAmount.toLocaleString()}</span>
                      </p>
                    </div>
                  )}
                  {payAutoCountry === 'rwanda' && (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-3 text-sm text-gray-800 dark:text-gray-200">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rwanda — RWF</p>
                      <p>
                        Pay exactly: <span className="font-semibold">RWF {rwfPayAmount.toLocaleString()}</span>
                      </p>
                    </div>
                  )}

                  {payAutoReady && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {payAutoCountry === 'nigeria'
                          ? 'Bank account (Nigeria)'
                          : payAutoCountry === 'cameroon'
                            ? 'Mobile Money (Cameroon)'
                            : 'Mobile Money (Rwanda)'}
                      </h3>
                      {payAutoAvailableAccounts.length > 1 && (
                        <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Select payment account</label>
                          <select
                            value={selectedPayAutoAccountId}
                            onChange={(e) => setSelectedPayAutoAccountId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                          >
                            {payAutoAvailableAccounts.map((account) => (
                              <option key={account.id} value={account.id}>
                                {account.bankName} - {account.accountNumber}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {!payAutoSelectedAccount && (
                        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-700 dark:text-amber-300">
                          No payment account configured for {payAutoSelectedCurrency}. Add one from Admin → Add Bank Account.
                        </div>
                      )}
                      {payAutoCountry === 'nigeria' && payAutoSelectedAccount && (
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Account number</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-mono font-medium text-gray-900 dark:text-gray-200">
                                {payAutoSelectedAccount.accountNumber || '-'}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCopyPayAuto('Account number', payAutoSelectedAccount.accountNumber)}
                                className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Account name</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 dark:text-gray-200">
                                {payAutoSelectedAccount.accountName || '-'}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCopyPayAuto('Account name', payAutoSelectedAccount.accountName)}
                                className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Bank</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 dark:text-gray-200">
                                {payAutoSelectedAccount.bankName || '-'}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCopyPayAuto('Bank', payAutoSelectedAccount.bankName)}
                                className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {payAutoCountry === 'cameroon' && payAutoSelectedAccount && (
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Mobile Money number</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-mono font-medium text-gray-900 dark:text-gray-200">{CAMEROON_MOMO_DISPLAY}</p>
                              <button
                                type="button"
                                onClick={() => handleCopyPayAuto('Mobile Money number', CAMEROON_MOMO_DISPLAY)}
                                className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Mobile money name</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 dark:text-gray-200">
                                {payAutoSelectedAccount.accountName || '-'}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCopyPayAuto('Mobile money name', payAutoSelectedAccount.accountName)}
                                className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Mobile money network</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 dark:text-gray-200">
                                {payAutoSelectedAccount.bankName || '-'}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCopyPayAuto('Mobile money network', payAutoSelectedAccount.bankName)}
                                className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {payAutoCountry === 'rwanda' && payAutoSelectedAccount && (
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Mobile Money number</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-mono font-medium text-gray-900 dark:text-gray-200">{RWANDA_MOMO_DISPLAY}</p>
                              <button
                                type="button"
                                onClick={() => handleCopyPayAuto('Mobile Money number', RWANDA_MOMO_DISPLAY)}
                                className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Mobile money name</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 dark:text-gray-200">
                                {payAutoSelectedAccount.accountName || '-'}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCopyPayAuto('Mobile money name', payAutoSelectedAccount.accountName)}
                                className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Mobile money network</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 dark:text-gray-200">
                                {payAutoSelectedAccount.bankName || '-'}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCopyPayAuto('Mobile money network', payAutoSelectedAccount.bankName)}
                                className="px-2 py-1 text-[11px] rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {payAutoCopiedField && (
                        <p className="text-xs text-green-600 dark:text-green-400">{payAutoCopiedField} copied to clipboard</p>
                      )}

                      <div>
                        <label htmlFor="pay-auto-name" className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Name on the account / mobile money you are paying from
                        </label>
                        <input
                          id="pay-auto-name"
                          type="text"
                          value={payAutoFullName}
                          onChange={(e) => setPayAutoFullName(e.target.value)}
                          placeholder="Account or mobile money name"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg"
                        />
                      </div>
                      {payAutoError && <p className="text-sm text-red-600 dark:text-red-400">{payAutoError}</p>}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPayAutoPanelOpen(false)
                            setPayAutoError('')
                          }}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitWatchAutoPay}
                          disabled={!payAutoSelectedAccount || !payAutoFullName.trim() || payAutoSubmitting}
                          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {payAutoSubmitting ? 'Submitting…' : 'I have made the payment'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {adsRemaining > 0 ? (
        <>
          {canUseAutoTask && (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
              <p className="text-sm text-primary-800 dark:text-primary-300 font-medium">
                High-tier auto task available
              </p>
              <p className="text-xs text-primary-700 dark:text-primary-400 mt-1">
                Tap once to auto-complete all remaining ads for this 24-hour cycle.
              </p>
              <button
                type="button"
                onClick={handleAutoTask}
                disabled={autoTaskRunning}
                className="mt-3 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {autoTaskRunning ? 'Completing task...' : 'Run Auto Task'}
              </button>
            </div>
          )}
          {!hasVideos && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
              <p className="text-amber-800 dark:text-amber-300 font-medium">No YouTube ad videos configured yet.</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">Admin should add YouTube links in Video Manager.</p>
            </div>
          )}
          {hasVideos && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Ad {Math.min(adsViewedToday + 1, dailyLimit)} of {dailyLimit}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-center mt-2 text-sm">
                  Watch for {REQUIRED_WATCH_SECONDS} seconds. Reward is added and next ads load automatically.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="rounded-lg overflow-hidden border border-gray-200 aspect-video bg-black">
                  {youtubeVideoId ? (
                    ytReady && !ytApiFailed ? (
                      <div id="watch-earn-yt-player" className="w-full h-full min-h-[200px]" />
                    ) : (
                      <iframe
                        title="Ad video"
                        src={youtubeEmbedUrl}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full min-h-[200px]"
                      />
                    )
                  ) : (
                    <div className="p-6 bg-gray-50 dark:bg-gray-700/50 space-y-3 flex items-center justify-center min-h-[200px]">
                      <p className="text-sm text-red-700 dark:text-red-400">
                        Invalid YouTube link. Please update this ad link in Video Manager.
                      </p>
                    </div>
                  )}
                </div>
                {fallbackMode && showFallbackManualHelp && !timerRunning && !canClaim && (
                  <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3">
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Compatibility mode: timer should start automatically. If it does not, tap Start timer.
                    </p>
                    <button
                      type="button"
                      onClick={startTimer}
                      disabled={timerRunning || canClaim}
                      className="mt-2 px-3 py-1.5 rounded bg-amber-600 text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {timerRunning ? 'Timer running...' : canClaim ? 'Completed' : 'Start timer'}
                    </button>
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Timer: <span className="font-semibold">{countdown}s</span> / {REQUIRED_WATCH_SECONDS}s
                  </p>
                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-600 mt-2 overflow-hidden">
                    <div className="h-full bg-primary-600" style={{ width: `${Math.min(100, ((REQUIRED_WATCH_SECONDS - countdown) / REQUIRED_WATCH_SECONDS) * 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{playerMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Show amount earned after each watch */}
          {lastEarned !== null && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center animate-fade-in">
              <p className="text-green-800 dark:text-green-300 font-semibold">+ ${lastEarned.toFixed(2)} earned</p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">Total today: ${(adsViewedToday * EARN_PER_AD_USD).toFixed(2)}</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">Daily limit reached</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You&apos;ve watched all your ads in this 24-hour window. You can watch again after 24hrs.
          </p>
          <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">Total earned (24h): ${totalEarnedToday.toFixed(2)}</p>
          {resetCountdown && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Next ads available in {resetCountdown}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default WatchEarn

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const EARN_PER_AD_USD = 0.4
const REQUIRED_WATCH_SECONDS = 30

function isYouTubeUrl(link) {
  const value = String(link || '').toLowerCase()
  return value.includes('youtube.com') || value.includes('youtu.be')
}

function getYoutubeEmbedUrl(link) {
  const value = String(link || '').trim()
  if (!value) return ''
  if (value.includes('/shorts/')) {
    const videoId = value.split('/shorts/')[1]?.split(/[?&/]/)[0]
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : ''
  }
  if (value.includes('/embed/')) {
    const videoId = value.split('/embed/')[1]?.split(/[?&/]/)[0]
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : ''
  }
  if (value.includes('youtu.be/')) {
    const videoId = value.split('youtu.be/')[1]?.split(/[?&]/)[0]
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : ''
  }
  try {
    const url = new URL(value)
    const videoId = url.searchParams.get('v')
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : ''
  } catch {
    return ''
  }
}

function WatchEarn() {
  const { userPack, PACKS_USD, adsViewedToday, watchAd, isAdminLoggedIn, freeAccessForSetup, adVideoIds } = useApp()
  const [lastEarned, setLastEarned] = useState(null)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [countdown, setCountdown] = useState(REQUIRED_WATCH_SECONDS)
  const [timerRunning, setTimerRunning] = useState(false)
  const [canClaim, setCanClaim] = useState(false)
  const [playerMessage, setPlayerMessage] = useState('Start timer and watch this ad to claim reward.')
  const lastCreditedAdKeyRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const countdownRef = useRef(REQUIRED_WATCH_SECONDS)
  const adsViewedTodayRef = useRef(0)
  const dailyLimitRef = useRef(0)

  const hasAccess = userPack || isAdminLoggedIn || freeAccessForSetup
  const packInfo = userPack ? PACKS_USD.find((p) => p.usd === userPack) : null
  const setupLimit = PACKS_USD[0]?.adsPerDay ?? 0
  const dailyLimit = packInfo ? packInfo.adsPerDay : (freeAccessForSetup ? setupLimit : 0)
  const adsRemaining = dailyLimit - adsViewedToday
  const totalEarnedToday = adsViewedToday * EARN_PER_AD_USD
  const youtubeAdLinks = adVideoIds.filter(isYouTubeUrl)
  const hasVideos = youtubeAdLinks.length > 0
  const currentAdLink = hasVideos ? youtubeAdLinks[currentAdIndex % youtubeAdLinks.length] : ''
  const currentAdKey = `${currentAdIndex}-${currentAdLink || 'none'}`
  const youtubeEmbedUrl = getYoutubeEmbedUrl(currentAdLink)

  useEffect(() => {
    countdownRef.current = countdown
  }, [countdown])

  useEffect(() => {
    adsViewedTodayRef.current = adsViewedToday
  }, [adsViewedToday])

  useEffect(() => {
    dailyLimitRef.current = dailyLimit
  }, [dailyLimit])

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setTimerRunning(false)
  }

  useEffect(() => {
    if (!hasAccess || adsRemaining <= 0 || !currentAdLink) return
    stopTimer()
    setCanClaim(false)
    setCountdown(REQUIRED_WATCH_SECONDS)
    setPlayerMessage('Start timer and watch this ad to claim reward.')
  }, [adsRemaining, currentAdKey, currentAdLink, hasAccess])

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [])

  const claimAdReward = (force = false) => {
    if (!force && !canClaim) return
    if (!hasVideos || !currentAdLink || adsViewedTodayRef.current >= dailyLimitRef.current) return
    if (lastCreditedAdKeyRef.current === currentAdKey) return

    lastCreditedAdKeyRef.current = currentAdKey
    watchAd()
    setLastEarned(EARN_PER_AD_USD)
    setCurrentAdIndex((prev) => prev + 1)
    stopTimer()
    setCanClaim(false)
    setCountdown(REQUIRED_WATCH_SECONDS)
    setPlayerMessage('Ad completed. Loading next ad...')
  }

  const startTimer = () => {
    if (timerRunning || canClaim) return
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    setTimerRunning(true)
    setPlayerMessage('Timer running... keep watching this ad.')

    timerIntervalRef.current = setInterval(() => {
      const next = countdownRef.current - 1
      const safeNext = Math.max(0, next)
      setCountdown(safeNext)
      countdownRef.current = safeNext

      if (next <= 0) {
        stopTimer()
        setCanClaim(true)
        setPlayerMessage('Ad completed. Loading next ad...')
        claimAdReward(true)
      }
    }, 1000)
  }

  if (!hasAccess) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access required</h2>
          <p className="text-gray-600 mb-6">
            You need to monetize a package before you can watch ads and earn. Buy Ad Engine and complete payment to get access to this page.
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
          >
            Buy Ad Engine
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Watch & Earn</h1>
        <p className="text-gray-600 mt-1">
          {packInfo ? `${packInfo.planName} active.` : `Setup access mode active (preview: ${setupLimit} ads/day).`} Earn ${EARN_PER_AD_USD.toFixed(2)} per completed ad.
        </p>
        {packInfo && <p className="text-xs text-gray-500 mt-1">Your package gives you {packInfo.adsPerDay} ads/day.</p>}
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Ads left today</p>
          <p className="text-2xl font-bold text-gray-900">{adsRemaining} / {dailyLimit}</p>
        </div>
        <div className="bg-primary-50 rounded-xl border border-primary-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Earned today</p>
          <p className="text-2xl font-bold text-primary-700">${totalEarnedToday.toFixed(2)}</p>
        </div>
      </div>

      {adsRemaining > 0 ? (
        <>
          {!hasVideos && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <p className="text-amber-800 font-medium">No YouTube ad videos configured yet.</p>
              <p className="text-sm text-amber-700 mt-1">Admin should add YouTube links in Video Manager.</p>
            </div>
          )}
          {hasVideos && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Ad {Math.min(adsViewedToday + 1, dailyLimit)} of {dailyLimit}
                </p>
                <p className="text-gray-600 text-center mt-2 text-sm">
                  Watch for {REQUIRED_WATCH_SECONDS} seconds. Reward is added and next ad loads automatically.
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  {youtubeEmbedUrl ? (
                    <iframe
                      title="Ad video"
                      src={youtubeEmbedUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full aspect-video bg-black"
                    />
                  ) : (
                    <div className="p-6 bg-gray-50 space-y-3">
                      <p className="text-sm text-red-700">
                        Invalid YouTube link. Please update this ad link in Video Manager.
                      </p>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Timer: <span className="font-semibold">{countdown}s</span> / {REQUIRED_WATCH_SECONDS}s
                  </p>
                  <div className="w-full h-2 rounded-full bg-gray-200 mt-2 overflow-hidden">
                    <div className="h-full bg-primary-600" style={{ width: `${Math.min(100, ((REQUIRED_WATCH_SECONDS - countdown) / REQUIRED_WATCH_SECONDS) * 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{playerMessage}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={startTimer}
                    disabled={timerRunning || canClaim}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    {timerRunning ? 'Timer running...' : canClaim ? 'Timer completed' : 'Start timer'}
                  </button>
                  <button
                    onClick={claimAdReward}
                    disabled={!canClaim}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    Claim manually
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Show amount earned after each watch */}
          {lastEarned !== null && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center animate-fade-in">
              <p className="text-green-800 font-semibold">+ ${lastEarned.toFixed(2)} earned</p>
              <p className="text-sm text-green-700 mt-1">Total today: ${(adsViewedToday * EARN_PER_AD_USD).toFixed(2)}</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-600 mb-4">You've watched all {dailyLimit} ads for today. Come back tomorrow for more.</p>
          <p className="text-primary-600 font-medium">Total earned today: ${totalEarnedToday.toFixed(2)}</p>
        </div>
      )}
    </div>
  )
}

export default WatchEarn

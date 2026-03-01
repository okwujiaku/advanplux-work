import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const EARN_PER_AD_USD = 0.4
const REQUIRED_WATCH_SECONDS = 30

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
  const userPack = app?.userPack
  const PACKS_USD = app?.PACKS_USD
  const adsViewedToday = app?.adsViewedToday ?? 0
  const watchAd = app?.watchAd
  const isAdminLoggedIn = app?.isAdminLoggedIn
  const freeAccessForSetup = app?.freeAccessForSetup
  const adVideoIds = app?.adVideoIds

  const [lastEarned, setLastEarned] = useState(null)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [countdown, setCountdown] = useState(REQUIRED_WATCH_SECONDS)
  const [timerRunning, setTimerRunning] = useState(false)
  const [canClaim, setCanClaim] = useState(false)
  const [playerMessage, setPlayerMessage] = useState('Click play on the video to start the timer.')
  const lastCreditedAdKeyRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const countdownRef = useRef(REQUIRED_WATCH_SECONDS)
  const adsViewedTodayRef = useRef(0)
  const dailyLimitRef = useRef(0)
  const timerStartedForAdRef = useRef(null)
  const playerRef = useRef(null)
  const startTimerRef = useRef(null)
  const stopTimerRef = useRef(null)
  const currentAdKeyRef = useRef(null)
  const [ytReady, setYtReady] = useState(false)

  const hasAccess = !!(userPack || isAdminLoggedIn || freeAccessForSetup)
  const packInfo = userPack && PACKS_USD ? PACKS_USD.find((p) => p.usd === userPack) : null
  const setupLimit = (PACKS_USD && PACKS_USD[0]?.adsPerDay) ?? 0
  const dailyLimit = packInfo ? packInfo.adsPerDay : (freeAccessForSetup ? setupLimit : 0)
  const adsRemaining = Math.max(0, (dailyLimit || 0) - (adsViewedToday || 0))
  const totalEarnedToday = (adsViewedToday || 0) * EARN_PER_AD_USD
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
    setPlayerMessage('Click play on the video to start the timer.')
    timerStartedForAdRef.current = null
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
  const [ytApiFailed, setYtApiFailed] = useState(false)
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

  const claimAdReward = (force = false) => {
    if (!force && !canClaim) return
    if (!hasVideos || !currentAdLink || adsViewedTodayRef.current >= dailyLimitRef.current) return
    if (lastCreditedAdKeyRef.current === currentAdKey) return

    lastCreditedAdKeyRef.current = currentAdKey
    if (typeof watchAd === 'function') watchAd()
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
  startTimerRef.current = startTimer

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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No active ads engine</h2>
          <p className="text-gray-600 mb-6">
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Watch & Earn</h1>
        {packInfo ? (
          <>
            <p className="text-primary-600 font-semibold mt-1">{packInfo.planName} — ${packInfo.usd} pack active</p>
            <p className="text-gray-600 mt-1">
              {packInfo.adsPerDay} ads per day · ${EARN_PER_AD_USD.toFixed(2)} per completed ad. Watch the full {REQUIRED_WATCH_SECONDS}s to earn.
            </p>
          </>
        ) : (
          <p className="text-gray-600 mt-1">
            Setup access mode active (preview: {setupLimit} ads/day). Earn ${EARN_PER_AD_USD.toFixed(2)} per completed ad.
          </p>
        )}
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
                  Watch for {REQUIRED_WATCH_SECONDS} seconds. Reward is added and next ad loads automatically. If you pause the video, the timer pauses too.
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
                    <div className="p-6 bg-gray-50 space-y-3 flex items-center justify-center min-h-[200px]">
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
          <p className="text-gray-800 font-medium mb-2">Daily limit reached</p>
          <p className="text-gray-600 mb-4">
            You've watched all {dailyLimit} ads for today for your {packInfo ? packInfo.planName : 'current'} pack. You can watch again tomorrow or activate another Ads Engine to get more ads now.
          </p>
          <p className="text-primary-600 font-medium mb-4">Total earned today: ${totalEarnedToday.toFixed(2)}</p>
          <Link
            to="/dashboard/purchase"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
          >
            Activate another Ads Engine
          </Link>
        </div>
      )}
    </div>
  )
}

export default WatchEarn

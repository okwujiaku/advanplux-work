import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const EARN_PER_AD_USD = 0.4
const REQUIRED_WATCH_SECONDS = 30

function WatchEarn() {
  const { userPack, PACKS_USD, adsViewedToday, watchAd, isAdminLoggedIn, freeAccessForSetup, adVideoIds } = useApp()
  const [lastEarned, setLastEarned] = useState(null)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [watchedSeconds, setWatchedSeconds] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [playerMessage, setPlayerMessage] = useState('Play and watch to unlock credit.')
  const playerRef = useRef(null)
  const playerElementIdRef = useRef(`ad-player-${Math.random().toString(36).slice(2, 10)}`)
  const watchIntervalRef = useRef(null)
  const lastPlayerSecondRef = useRef(0)
  const watchedSecondsRef = useRef(0)
  const completionTargetRef = useRef(REQUIRED_WATCH_SECONDS)
  const lastCreditedAdKeyRef = useRef(null)

  const hasAccess = userPack || isAdminLoggedIn || freeAccessForSetup
  const packInfo = userPack ? PACKS_USD.find((p) => p.usd === userPack) : null
  const setupLimit = PACKS_USD[0]?.adsPerDay ?? 0
  const dailyLimit = packInfo ? packInfo.adsPerDay : (freeAccessForSetup ? setupLimit : 0)
  const adsRemaining = dailyLimit - adsViewedToday
  const totalEarnedToday = adsViewedToday * EARN_PER_AD_USD
  const hasVideos = adVideoIds.length > 0
  const currentVideoId = hasVideos ? adVideoIds[currentAdIndex % adVideoIds.length] : null
  const currentAdKey = `${currentAdIndex}-${currentVideoId || 'none'}`
  const completionTarget = Math.max(1, Math.min(REQUIRED_WATCH_SECONDS, Math.floor(videoDuration || REQUIRED_WATCH_SECONDS)))
  const canCredit = watchedSeconds >= completionTarget

  useEffect(() => {
    watchedSecondsRef.current = watchedSeconds
  }, [watchedSeconds])

  useEffect(() => {
    completionTargetRef.current = completionTarget
  }, [completionTarget])

  useEffect(() => {
    if (!hasAccess || adsRemaining <= 0 || !currentVideoId) return undefined

    let isMounted = true
    const mountPlayer = () => {
      if (!isMounted || !window.YT || !window.YT.Player) return
      if (playerRef.current?.destroy) playerRef.current.destroy()

      playerRef.current = new window.YT.Player(playerElementIdRef.current, {
        videoId: currentVideoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return
            setIsPlayerReady(true)
            setVideoDuration(event.target.getDuration() || 0)
            setPlayerMessage('Play and watch to unlock credit.')
            lastPlayerSecondRef.current = 0
          },
          onStateChange: (event) => {
            if (!isMounted) return
            const state = event.data
            if (state === window.YT.PlayerState.PLAYING) {
              setPlayerMessage('Watching in progress...')
              if (watchIntervalRef.current) clearInterval(watchIntervalRef.current)
              watchIntervalRef.current = setInterval(() => {
                if (!playerRef.current?.getCurrentTime) return
                const currentSecond = Math.floor(playerRef.current.getCurrentTime())
                const delta = currentSecond - lastPlayerSecondRef.current

                if (delta === 1) {
                  setWatchedSeconds((prev) => Math.min(completionTargetRef.current, prev + 1))
                }

                if (delta >= 2) {
                  setPlayerMessage('Skipping is not counted. Please watch continuously.')
                }

                lastPlayerSecondRef.current = currentSecond
              }, 1000)
            } else {
              if (watchIntervalRef.current) {
                clearInterval(watchIntervalRef.current)
                watchIntervalRef.current = null
              }
            }

            if (state === window.YT.PlayerState.ENDED && watchedSecondsRef.current < completionTargetRef.current) {
              setPlayerMessage('Replay to complete required watch time.')
            }
          },
        },
      })
    }

    if (window.YT?.Player) {
      mountPlayer()
    } else {
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        document.body.appendChild(script)
      }

      const previousReady = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReady === 'function') previousReady()
        mountPlayer()
      }
    }

    return () => {
      isMounted = false
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current)
        watchIntervalRef.current = null
      }
      if (playerRef.current?.destroy) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [currentVideoId, hasAccess, adsRemaining])

  useEffect(() => {
    if (!canCredit || !hasVideos || !currentVideoId || adsViewedToday >= dailyLimit) return
    if (lastCreditedAdKeyRef.current === currentAdKey) return

    lastCreditedAdKeyRef.current = currentAdKey
    watchAd()
    setLastEarned(EARN_PER_AD_USD)
    setCurrentAdIndex((prev) => prev + 1)
    setWatchedSeconds(0)
    setVideoDuration(0)
    setIsPlayerReady(false)
    setPlayerMessage('Ad completed. Loading next ad...')
  }, [adsViewedToday, canCredit, currentAdKey, currentVideoId, dailyLimit, hasVideos, watchAd])

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
              <p className="text-amber-800 font-medium">No ad videos configured yet.</p>
              <p className="text-sm text-amber-700 mt-1">Admin should add YouTube video IDs in Video Manager.</p>
            </div>
          )}
          {hasVideos && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Ad {Math.min(adsViewedToday + 1, dailyLimit)} of {dailyLimit}
              </p>
              <p className="text-gray-600 text-center mt-2 text-sm">
                Watch this video ad for {completionTarget} seconds. Credit is added automatically when completed.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <div id={playerElementIdRef.current} className="w-full aspect-video bg-black" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Progress: <span className="font-semibold">{watchedSeconds}</span> / {completionTarget} seconds
                </p>
                <div className="w-full h-2 rounded-full bg-gray-200 mt-2 overflow-hidden">
                  <div className="h-full bg-primary-600" style={{ width: `${Math.min(100, (watchedSeconds / completionTarget) * 100)}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-2">{isPlayerReady ? playerMessage : 'Loading video player...'}</p>
              </div>
              <p className={`text-sm font-medium text-center ${canCredit ? 'text-green-600' : 'text-gray-500'}`}>
                {canCredit ? 'Completed. Adding $0.40 and loading next ad...' : 'Keep watching to auto-credit this ad.'}
              </p>
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

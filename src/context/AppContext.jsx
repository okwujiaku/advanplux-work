import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'

const AppContext = createContext(null)

// Set to false so only users with an approved deposit (userPack) or admin can watch ads
const FREE_ACCESS_FOR_SETUP = false

// Packs in USD with Naira, CFA, plan name, and ads per day
export const PACKS_USD = [
  { usd: 20, naira: 29000, cfa: 12000, adsPerDay: 2, planName: 'Mini Ads Engine' },
  { usd: 50, naira: 72500, cfa: 30000, adsPerDay: 5, planName: 'Mini plux Ads Engine' },
  { usd: 100, naira: 145000, cfa: 60000, adsPerDay: 10, planName: 'Midi Ads Engine' },
  { usd: 200, naira: 290000, cfa: 120000, adsPerDay: 20, planName: 'Midi Plux Ads Engine' },
  { usd: 500, naira: 725000, cfa: 300000, adsPerDay: 50, planName: 'Maxi Ads Engine' },
  { usd: 1000, naira: 1450000, cfa: 600000, adsPerDay: 100, planName: 'Maxi Plux Ads Engine' },
]

const DEFAULT_AD_VIDEO_IDS = [
  'https://www.youtube.com/watch?v=XqNKXOqQaKg',
  'https://www.youtube.com/watch?v=ZgNkU0EgbmY',
  'https://www.youtube.com/watch?v=d3Q1nPjTKs4',
  'https://www.youtube.com/watch?v=JUUMzploWs4',
  'https://www.youtube.com/watch?v=ayunWvACnMU',
]

const EARN_PER_AD_USD = 0.4
const NGN_TO_USD = 1 / 1450
const AUTH_SESSION_TOKEN_KEY = 'authSessionToken'

// Only auth token stays in localStorage; all other data comes from Supabase/API.
function getStoredToken() {
  if (typeof window === 'undefined' || !window.localStorage) return null
  return window.localStorage.getItem(AUTH_SESSION_TOKEN_KEY)
}
function getAdminSession() {
  if (typeof window === 'undefined' || !window.sessionStorage) return false
  return window.sessionStorage.getItem('adminLoggedIn') === 'true'
}

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '')
}

function generateInvitationCode(existingUsers) {
  const existingCodes = new Set(existingUsers.map((user) => user.myInvitationCode))
  let code = ''
  do {
    code = `ADV${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  } while (existingCodes.has(code))
  return code
}

function isYouTubeUrl(value) {
  const link = String(value || '').toLowerCase()
  return link.includes('youtube.com') || link.includes('youtu.be')
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)
  const [userPack, setUserPack] = useState(null)
  const [savedAccount, setSavedAccount] = useState(null)
  const [savedDepositDetails, setSavedDepositDetails] = useState([])
  const [savedWithdrawalDetails, setSavedWithdrawalDetails] = useState([])
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [walletUsd, setWalletUsd] = useState(0)
  const [teamGenerated, setTeamGenerated] = useState(0)
  const [teamCount, setTeamCount] = useState(0)
  const [securityPins, setSecurityPins] = useState({})
  const [remoteHasPin, setRemoteHasPin] = useState(null)
  const [referralEarnings, setReferralEarnings] = useState({ level1: 0, level2: 0, level3: 0 })
  const [claimedSalary, setClaimedSalary] = useState(0)
  const [adsViewedToday, setAdsViewedToday] = useState(0)
  const [earningsHistory, setEarningsHistory] = useState([])
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => getAdminSession())
  const [adVideoIds, setAdVideoIds] = useState(DEFAULT_AD_VIDEO_IDS)
  const [authCheckDone, setAuthCheckDone] = useState(false)

  const saveSessionToken = useCallback((token) => {
    if (typeof window === 'undefined' || !window.localStorage) return
    if (token) {
      window.localStorage.setItem(AUTH_SESSION_TOKEN_KEY, token)
      return
    }
    window.localStorage.removeItem(AUTH_SESSION_TOKEN_KEY)
  }, [])

  const currentUser = users.find((user) => user.id === currentUserId) || null
  const isAuthenticated = !!currentUser

  const referralCount = useMemo(() => {
    if (!currentUser) return { level1: 0, level2: 0, level3: 0 }
    const level1Users = users.filter((user) => user.referredByUserId === currentUser.id)
    const level1Ids = new Set(level1Users.map((user) => user.id))
    const level2Users = users.filter((user) => user.referredByUserId && level1Ids.has(user.referredByUserId))
    const level2Ids = new Set(level2Users.map((user) => user.id))
    const level3Users = users.filter((user) => user.referredByUserId && level2Ids.has(user.referredByUserId))
    return {
      level1: level1Users.length,
      level2: level2Users.length,
      level3: level3Users.length,
    }
  }, [currentUser, users])

  const localSignUp = useCallback(({ phone, email, password, confirmPassword, invitationCode }) => {
    const normalizedPhone = normalizePhone(phone)
    const normalizedEmail = normalizeEmail(email)
    const cleanPassword = String(password || '')
    const cleanConfirmPassword = String(confirmPassword || '')
    const cleanInvitationCode = String(invitationCode || '').trim().toUpperCase()

    if (!normalizedPhone || !normalizedEmail || !cleanPassword || !cleanConfirmPassword) {
      return { ok: false, error: 'All fields are required.' }
    }
    if (cleanPassword !== cleanConfirmPassword) {
      return { ok: false, error: 'Password and confirm password must match.' }
    }
    if (users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
      return { ok: false, error: 'Email already exists.' }
    }
    if (users.some((user) => normalizePhone(user.phone) === normalizedPhone)) {
      return { ok: false, error: 'Phone number already exists.' }
    }

    let referredByUserId = null
    if (cleanInvitationCode) {
      const referrer = users.find((user) => user.myInvitationCode === cleanInvitationCode)
      if (!referrer) {
        return { ok: false, error: 'Invalid invitation code.' }
      }
      referredByUserId = referrer.id
    }

    const newUser = {
      id: newId('usr'),
      phone: normalizedPhone,
      email: normalizedEmail,
      password: cleanPassword,
      myInvitationCode: generateInvitationCode(users),
      referredByUserId,
      createdAt: new Date().toISOString(),
    }

    setUsers((prev) => [newUser, ...prev])
    setCurrentUserId(newUser.id)
    return { ok: true, user: newUser }
  }, [users])

  const localSignIn = useCallback(({ emailOrPhone, password }) => {
    const identifier = String(emailOrPhone || '').trim()
    const cleanPassword = String(password || '')
    if (!identifier || !cleanPassword) return { ok: false, error: 'Email/phone and password are required.' }

    const normalizedEmail = normalizeEmail(identifier)
    const normalizedPhone = normalizePhone(identifier)

    const user = users.find((candidate) =>
      normalizeEmail(candidate.email) === normalizedEmail || normalizePhone(candidate.phone) === normalizedPhone,
    )

    if (!user || user.password !== cleanPassword) {
      return { ok: false, error: 'Invalid login details.' }
    }

    setCurrentUserId(user.id)
    return { ok: true, user }
  }, [users])

  const signUp = useCallback(async ({ phone, email, password, confirmPassword, invitationCode }) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email, password, confirmPassword, invitationCode }),
      })
      const payload = await response.json()
      if (response.ok && payload?.ok && payload.user) {
        const serverUser = payload.user
        const localUser = {
          id: serverUser.id,
          phone: normalizePhone(phone),
          email: normalizeEmail(email),
          password: String(password || ''),
          myInvitationCode: serverUser.invitationCode || generateInvitationCode(users),
          referredByUserId: serverUser.referredByUserId || null,
          createdAt: serverUser.createdAt || new Date().toISOString(),
        }
        setUsers((prev) => {
          const withoutDuplicate = prev.filter((candidate) => candidate.id !== localUser.id && candidate.email !== localUser.email)
          return [localUser, ...withoutDuplicate]
        })
        setCurrentUserId(localUser.id)
        saveSessionToken(payload.token || '')
        return { ok: true, user: localUser }
      }

      const shouldFallback =
        response.status === 503 ||
        response.status >= 500 ||
        payload?.code === 'BACKEND_NOT_CONFIGURED'
      if (shouldFallback) {
        return localSignUp({ phone, email, password, confirmPassword, invitationCode })
      }
      return { ok: false, error: payload?.error || 'Unable to create account.' }
    } catch {
      return localSignUp({ phone, email, password, confirmPassword, invitationCode })
    }
  }, [localSignUp, saveSessionToken, users])

  const signIn = useCallback(async ({ emailOrPhone, password }) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password }),
      })
      const payload = await response.json()
      if (response.ok && payload?.ok && payload.user) {
        const serverUser = payload.user
        setUsers((prev) => {
          const existing = prev.find((candidate) => candidate.id === serverUser.id || candidate.email === serverUser.email)
          const normalized = {
            id: serverUser.id,
            phone: serverUser.phone || existing?.phone || '',
            email: normalizeEmail(serverUser.email),
            password: existing?.password || '',
            myInvitationCode: serverUser.invitationCode || existing?.myInvitationCode || '',
            referredByUserId: serverUser.referredByUserId || existing?.referredByUserId || null,
            createdAt: serverUser.createdAt || existing?.createdAt || new Date().toISOString(),
          }
          const withoutDuplicate = prev.filter((candidate) => candidate.id !== normalized.id && candidate.email !== normalized.email)
          return [normalized, ...withoutDuplicate]
        })
        setCurrentUserId(serverUser.id)
        saveSessionToken(payload.token || '')
        return { ok: true, user: serverUser }
      }

      if (response.status === 401) {
        return localSignIn({ emailOrPhone, password })
      }

      const shouldFallback =
        response.status === 503 ||
        response.status >= 500 ||
        payload?.code === 'BACKEND_NOT_CONFIGURED'
      if (shouldFallback) {
        return localSignIn({ emailOrPhone, password })
      }
      return { ok: false, error: payload?.error || 'Unable to sign in.' }
    } catch {
      return localSignIn({ emailOrPhone, password })
    }
  }, [localSignIn, saveSessionToken])

  const signOut = useCallback(() => {
    setCurrentUserId(null)
    saveSessionToken('')
  }, [saveSessionToken])

  const resetPassword = useCallback(
    async ({ emailOrPhone, pin, newPassword, confirmPassword }) => {
      const identifier = String(emailOrPhone || '').trim()
      const pinStr = String(pin ?? '').trim()
      const nextPassword = String(newPassword || '')
      const confirmNextPassword = String(confirmPassword || '')
      if (!identifier || !nextPassword || !confirmNextPassword) {
        return { ok: false, error: 'All fields are required.' }
      }
      if (nextPassword !== confirmNextPassword) {
        return { ok: false, error: 'New password and confirm password must match.' }
      }
      if (!/^\d{4}$/.test(pinStr)) {
        return { ok: false, error: 'Security PIN must be 4 digits.' }
      }

      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailOrPhone: identifier,
            pin: pinStr,
            newPassword: nextPassword,
            confirmPassword: confirmNextPassword,
          }),
        })
        const payload = await res.json().catch(() => ({}))
        if (res.ok && payload?.ok) {
          return { ok: true }
        }
        if (res.status === 503 || res.status >= 500) {
          return { ok: false, error: payload?.error || 'Password reset is not available. Contact support.' }
        }
        return { ok: false, error: payload?.error || 'Could not reset password.' }
      } catch {
        return { ok: false, error: 'Password reset is not available. Contact support.' }
      }
    },
    [],
  )

  // Restore user session from token; avoid showing sign-in until we've checked
  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setAuthCheckDone(true)
      return
    }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && d?.user) {
          const u = d.user
          setUsers((prev) => {
            const exists = prev.some((x) => x.id === u.id)
            if (exists) return prev.map((x) => (x.id === u.id ? { ...x, ...u } : x))
            return [{ id: u.id, email: u.email, phone: u.phone, myInvitationCode: u.invitationCode, referredByUserId: u.referredByUserId, createdAt: u.createdAt }]
          })
          setCurrentUserId(u.id)
          // Fetch wallet immediately so balance shows after refresh (same token)
          const headers = { Authorization: `Bearer ${token}` }
          fetch('/api/user/wallet', { headers })
            .then((r) => r.json())
            .then((w) => {
              if (w?.ok && w.balanceUsd != null) setWalletUsd(w.balanceUsd)
              if (w?.ok && w.activePackUsd != null) setUserPack(w.activePackUsd)
            })
            .catch(() => {})
          fetch('/api/user/deposits', { headers }).then((r) => r.json()).then((d2) => {
            if (d2?.ok && Array.isArray(d2.deposits)) setDeposits(d2.deposits)
          }).catch(() => {})
          fetch('/api/user/withdrawals', { headers }).then((r) => r.json()).then((wd) => {
            if (wd?.ok && Array.isArray(wd.withdrawals)) setWithdrawals(wd.withdrawals)
          }).catch(() => {})
          fetch('/api/user/earnings', { headers }).then((r) => r.json()).then((e) => {
            if (e?.ok && Array.isArray(e.earnings)) {
              setEarningsHistory(e.earnings)
              const today = new Date()
              const isToday = (dateStr) => {
                if (!dateStr) return false
                const x = new Date(dateStr)
                return x.getDate() === today.getDate() && x.getMonth() === today.getMonth() && x.getFullYear() === today.getFullYear()
              }
              const watchAdsToday = e.earnings.filter((x) => x.source === 'watch-ads' && isToday(x.date)).length
              setAdsViewedToday(watchAdsToday)
            }
          }).catch(() => {})
        }
        setAuthCheckDone(true)
      })
      .catch(() => setAuthCheckDone(true))
  }, [])

  // Fetch ad video list from backend (single source of truth)
  useEffect(() => {
    let cancelled = false
    fetch('/api/ad-videos')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d?.ok || !Array.isArray(d.urls)) return
        if (d.urls.length > 0) {
          setAdVideoIds(d.urls)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!currentUserId) {
      setRemoteHasPin(null)
      return
    }
    const token = getStoredToken()
    if (!token) {
      setRemoteHasPin(null)
      return
    }
    fetch('/api/auth/pin-status', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setRemoteHasPin(!!d.hasPin)
      })
      .catch(() => setRemoteHasPin(false))
  }, [currentUserId])

  // When authenticated, fetch withdrawal details from Supabase
  useEffect(() => {
    const token = getStoredToken()
    if (!currentUserId || !token) return
    fetch('/api/user/withdrawal-details', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.detail) {
          const d2 = d.detail
          setSavedWithdrawalDetails([
            {
              id: 'wdacc-supabase',
              currency: d2.currency || 'NGN',
              accountName: d2.accountName || '',
              accountNumber: d2.accountNumber || '',
              bankName: d2.bankName || '',
              createdAt: d2.createdAt || new Date().toISOString(),
            },
          ])
        } else if (d.ok && !d.detail) {
          setSavedWithdrawalDetails([])
        }
      })
      .catch(() => {})
  }, [currentUserId])

  const refetchWalletAndDeposits = useCallback(() => {
    const token = getStoredToken()
    if (!currentUserId || !token) return
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch('/api/user/wallet', { headers }).then((r) => r.json()),
      fetch('/api/user/deposits', { headers }).then((r) => r.json()),
      fetch('/api/user/withdrawals', { headers }).then((r) => r.json()),
      fetch('/api/user/earnings', { headers }).then((r) => r.json()),
    ])
      .then(([w, d, wd, e]) => {
        if (w?.ok) {
          if (w.balanceUsd != null) setWalletUsd(w.balanceUsd)
          if (w.activePackUsd != null) setUserPack(w.activePackUsd)
        }
        if (d?.ok && Array.isArray(d.deposits)) setDeposits(d.deposits)
        if (wd?.ok && Array.isArray(wd.withdrawals)) setWithdrawals(wd.withdrawals)
        if (e?.ok && Array.isArray(e.earnings)) {
          setEarningsHistory(e.earnings)
          const today = new Date()
          const isToday = (dateStr) => {
            if (!dateStr) return false
            const x = new Date(dateStr)
            return x.getDate() === today.getDate() && x.getMonth() === today.getMonth() && x.getFullYear() === today.getFullYear()
          }
          const watchAdsToday = e.earnings.filter((x) => x.source === 'watch-ads' && isToday(x.date)).length
          setAdsViewedToday(watchAdsToday)
        }
      })
      .catch(() => {})
  }, [currentUserId])

  // When authenticated, fetch wallet, deposits, withdrawals, earnings from Supabase (single source of truth)
  useEffect(() => {
    refetchWalletAndDeposits()
  }, [refetchWalletAndDeposits])

  const saveDepositDetail = useCallback((detail) => {
    if (!detail?.accountNumber?.trim()) return null
    const normalized = {
      id: detail.id || newId('depacc'),
      country: detail.country || '',
      methodType: detail.methodType || '',
      accountName: detail.accountName?.trim() || '',
      accountNumber: detail.accountNumber.trim(),
      bankName: detail.bankName?.trim() || '',
      createdAt: detail.createdAt || new Date().toISOString(),
    }

    setSavedDepositDetails((prev) => {
      const exists = prev.some((item) =>
        item.country === normalized.country &&
        item.accountNumber === normalized.accountNumber &&
        item.accountName === normalized.accountName &&
        item.bankName === normalized.bankName,
      )
      if (exists) return prev
      return [normalized, ...prev]
    })
    return normalized.id
  }, [])

  const saveWithdrawalDetail = useCallback(
    async (detail) => {
      if (!detail?.accountNumber?.trim()) return null
      const normalizedCurrency = detail.currency || 'NGN'
      const digitsOnlyAccountNumber = detail.accountNumber.replace(/\D/g, '')
      const normalizedAccountNumber =
        normalizedCurrency === 'NGN' && digitsOnlyAccountNumber.length === 11 && digitsOnlyAccountNumber.startsWith('0')
          ? digitsOnlyAccountNumber.slice(1)
          : digitsOnlyAccountNumber || detail.accountNumber.replace(/\s+/g, '')
      const normalized = {
        id: detail.id || newId('wdacc'),
        currency: normalizedCurrency,
        accountName: detail.accountName?.trim() || '',
        accountNumber: normalizedAccountNumber,
        bankName: detail.bankName?.trim() || '',
        createdAt: detail.createdAt || new Date().toISOString(),
      }

      const token =
        typeof window !== 'undefined' && window.localStorage
          ? getStoredToken()
          : null
      if (token) {
        try {
          const res = await fetch('/api/user/withdrawal-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              currency: normalized.currency,
              accountName: normalized.accountName,
              accountNumber: normalized.accountNumber,
              bankName: normalized.bankName,
            }),
          })
          const data = await res.json().catch(() => ({}))
          if (!data.ok) return null
          setSavedWithdrawalDetails([{ ...normalized, id: 'wdacc-supabase' }])
          return normalized.id
        } catch {
          return null
        }
      }

      let savedId = normalized.id
      setSavedWithdrawalDetails((prev) => {
        const existing = prev[0]
        savedId = existing?.id || normalized.id
        return [{ ...normalized, id: savedId }]
      })
      return savedId
    },
    [],
  )

  const addDeposit = useCallback(
    async (data) => {
      const now = new Date().toISOString()
      const payload = {
        userId: data.userId || currentUserId || 'current-user',
        amount: data.amount,
        amountUsd: Number(data.amountUsd) ?? Number(data.pack) ?? 0,
        currency: data.currency,
        country: data.country,
        paymentType: data.paymentType,
        accountName: data.accountName || '',
        accountNumber: data.accountNumber || '',
        bankName: data.bankName || '',
        accountUsed: data.accountNumber || data.accountUsed || '',
        pack: data.pack,
      }
      const token =
        typeof window !== 'undefined' && window.localStorage
          ? getStoredToken()
          : null
      if (token) {
        try {
          const res = await fetch('/api/user/deposits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          })
          const out = await res.json().catch(() => ({}))
          if (out?.ok && out.deposit) {
            setDeposits((prev) => [out.deposit, ...prev])
            if (data.saveDetail) {
              saveDepositDetail({
                country: data.country,
                methodType: data.paymentType,
                accountName: data.accountName,
                accountNumber: data.accountNumber,
                bankName: data.bankName,
              })
              setSavedAccount({ country: data.country, accountNumber: data.accountNumber })
            }
            return out.deposit.id
          }
        } catch {
          // fall through to local
        }
      }
      const id = newId('dep')
      if (data.saveDetail) {
        saveDepositDetail({
          country: data.country,
          methodType: data.paymentType,
          accountName: data.accountName,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
        })
        setSavedAccount({ country: data.country, accountNumber: data.accountNumber })
      }
      setDeposits((prev) => [
        { ...payload, id, date: now, status: 'pending' },
        ...prev,
      ])
      return id
    },
    [currentUserId, saveDepositDetail],
  )

  const addWithdrawal = useCallback(
    async (data) => {
      const now = new Date().toISOString()
      const payload = {
        amountUsd: data.amountUsd,
        feeUsd: data.feeUsd,
        netAmountUsd: data.netAmountUsd,
        currency: data.currency,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        bankName: data.bankName,
      }
      const token =
        typeof window !== 'undefined' && window.localStorage
          ? getStoredToken()
          : null
      if (token) {
        try {
          const res = await fetch('/api/user/withdrawals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          })
          const out = await res.json().catch(() => ({}))
          if (out?.ok && out.withdrawal) {
            setWithdrawals((prev) => [out.withdrawal, ...prev])
            if (data.saveDetail) {
              await saveWithdrawalDetail({
                currency: data.currency,
                accountName: data.accountName,
                accountNumber: data.accountNumber,
                bankName: data.bankName,
              })
            }
            return out.withdrawal.id
          }
        } catch {
          // fall through to local
        }
      }
      const id = newId('wd')
      if (data.saveDetail) {
        await saveWithdrawalDetail({
          currency: data.currency,
          accountName: data.accountName,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
        })
      }
      setWithdrawals((prev) => [{ ...data, id, date: now, status: 'pending' }, ...prev])
      return id
    },
    [saveWithdrawalDetail],
  )

  const activatePack = useCallback(async (packUsd) => {
    const token = getStoredToken()
    if (!token || !packUsd) return false
    try {
      const res = await fetch('/api/user/wallet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activatePackUsd: packUsd }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) {
        if (data.balanceUsd != null) setWalletUsd(data.balanceUsd)
        if (data.activePackUsd != null) setUserPack(data.activePackUsd)
        return true
      }
    } catch {
      // ignore
    }
    return false
  }, [])

  const hasToken = useMemo(() => {
    if (typeof window === 'undefined' || !window.localStorage) return false
    return !!getStoredToken()
  }, [currentUserId])

  const hasSecurityPin = useMemo(() => {
    if (!currentUserId) return false
    if (hasToken && remoteHasPin === true) return true
    return !!(securityPins[currentUserId])
  }, [currentUserId, hasToken, remoteHasPin, securityPins])

  const setSecurityPinForCurrentUser = useCallback(
    async (pin) => {
      const normalized = String(pin || '').trim()
      if (!currentUserId || !/^\d{4}$/.test(normalized)) return false
      const token =
        typeof window !== 'undefined' && window.localStorage
          ? getStoredToken()
          : null
      if (token) {
        try {
          const res = await fetch('/api/auth/set-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ pin: normalized }),
          })
          const data = await res.json().catch(() => ({}))
          if (data.ok) {
            setRemoteHasPin(true)
            setSecurityPins((prev) => ({ ...prev, [currentUserId]: normalized }))
            return true
          }
          // API failed (e.g. Supabase not configured): save PIN locally so user can still use the app
          setSecurityPins((prev) => ({ ...prev, [currentUserId]: normalized }))
          return true
        } catch {
          // Network or other error: save PIN locally so creation still succeeds
          setSecurityPins((prev) => ({ ...prev, [currentUserId]: normalized }))
          return true
        }
      }
      setSecurityPins((prev) => ({ ...prev, [currentUserId]: normalized }))
      return true
    },
    [currentUserId],
  )

  const verifySecurityPinForCurrentUser = useCallback(
    async (pin) => {
      const normalized = String(pin || '').trim()
      if (!currentUserId || !/^\d{4}$/.test(normalized)) return false
      const token =
        typeof window !== 'undefined' && window.localStorage
          ? getStoredToken()
          : null
      if (token) {
        try {
          const res = await fetch('/api/auth/verify-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ pin: normalized }),
          })
          const data = await res.json().catch(() => ({}))
          if (data?.verified) return true
          // API said no or failed: if we have PIN saved locally (e.g. after set-pin API failed), verify locally
          const expected = securityPins[currentUserId]
          return !!expected && String(expected) === normalized
        } catch {
          const expected = securityPins[currentUserId]
          return !!expected && String(expected) === normalized
        }
      }
      const expected = securityPins[currentUserId]
      return !!expected && String(expected) === normalized
    },
    [currentUserId, securityPins],
  )

  const approveDeposit = useCallback((id) => {
    let approvedDeposit = null
    const approvedAt = new Date().toISOString()
    setDeposits((prev) =>
      prev.map((d) => {
        if (d.id !== id || d.status !== 'pending') return d
        approvedDeposit = d
        return { ...d, status: 'approved', approvedAt }
      }),
    )
  }, [])

  const rejectDeposit = useCallback((id) => {
    setDeposits((prev) =>
      prev.map((d) => (d.id === id && d.status === 'pending' ? { ...d, status: 'rejected', rejectedAt: new Date().toISOString() } : d)),
    )
  }, [])

  const reverseDeposit = useCallback((id) => {
    const reversedAt = new Date().toISOString()
    setDeposits((prev) =>
      prev.map((d) => (d.id === id && d.status === 'approved' ? { ...d, status: 'reversed', reversedAt } : d)),
    )
  }, [])

  const approveWithdrawal = useCallback((id) => {
    let approvedAmountUsd = 0
    let updated = false
    setWithdrawals((prev) => {
      const target = prev.find((w) => w.id === id)
      if (!target || target.status !== 'pending') return prev
      approvedAmountUsd = Number(target.amountUsd || 0)
      if (walletUsd < approvedAmountUsd) return prev
      updated = true
      return prev.map((w) => (w.id === id ? { ...w, status: 'approved', approvedAt: new Date().toISOString() } : w))
    })
    if (updated) {
      setWalletUsd((balance) => Number((balance - approvedAmountUsd).toFixed(2)))
    }
    return updated
  }, [walletUsd])

  const rejectWithdrawal = useCallback((id) => {
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === id && w.status === 'pending' ? { ...w, status: 'rejected', rejectedAt: new Date().toISOString() } : w)),
    )
  }, [])

  const reverseWithdrawal = useCallback((id) => {
    let restoreAmount = 0
    let reversed = false
    setWithdrawals((prev) => {
      const target = prev.find((w) => w.id === id)
      if (!target || target.status !== 'approved') return prev
      restoreAmount = Number(target.amountUsd || 0)
      reversed = true
      return prev.map((w) => (w.id === id ? { ...w, status: 'reversed', reversedAt: new Date().toISOString() } : w))
    })
    if (reversed) {
      setWalletUsd((balance) => Number((balance + restoreAmount).toFixed(2)))
    }
  }, [])

  const claimSalary = useCallback((amount) => {
    setClaimedSalary((prev) => prev + amount)
    setEarningsHistory((prev) => [
      {
        id: newId('earn'),
        source: 'team-salary',
        amountUsd: Number(amount || 0),
        note: 'Weekly team salary claimed',
        date: new Date().toISOString(),
      },
      ...prev,
    ])
  }, [])

  const watchAd = useCallback(() => {
    const token =
      typeof window !== 'undefined' && window.localStorage
        ? getStoredToken()
        : null
    if (token) {
      fetch('/api/user/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          source: 'watch-ads',
          amountUsd: EARN_PER_AD_USD,
          note: 'Watched ad and earned reward',
        }),
      }).catch(() => {})
      fetch('/api/user/wallet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ addUsd: EARN_PER_AD_USD }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d?.ok && d.balanceUsd != null) setWalletUsd(d.balanceUsd)
        })
        .catch(() => {})
    }
    setAdsViewedToday((prev) => prev + 1)
    setWalletUsd((prev) => Number((prev + EARN_PER_AD_USD).toFixed(2)))
    setEarningsHistory((prev) => [
      {
        id: newId('earn'),
        source: 'watch-ads',
        amountUsd: EARN_PER_AD_USD,
        note: 'Watched ad and earned reward',
        date: new Date().toISOString(),
      },
      ...prev,
    ])
  }, [])

  const deleteUserAccount = useCallback((userId) => {
    if (!userId) return
    setUsers((prev) => prev.filter((user) => user.id !== userId))
    if (currentUserId === userId) {
      setCurrentUserId(null)
      saveSessionToken('')
    }
  }, [currentUserId, saveSessionToken])

  useEffect(() => {
    const referralTotalNgn = Number(referralEarnings.level1 || 0) + Number(referralEarnings.level2 || 0) + Number(referralEarnings.level3 || 0)
    const referralTotalUsd = Number((referralTotalNgn * NGN_TO_USD).toFixed(2))
    if (!referralTotalUsd || referralTotalUsd <= 0) return
    setEarningsHistory((prev) => {
      const existing = prev.find((entry) => entry.source === 'referral-total')
      if (existing) {
        return prev.map((entry) =>
          entry.source === 'referral-total'
            ? { ...entry, amountUsd: referralTotalUsd, date: new Date().toISOString(), note: 'Referral earnings summary' }
            : entry,
        )
      }
      return [
        {
          id: newId('earn'),
          source: 'referral-total',
          amountUsd: referralTotalUsd,
          note: 'Referral earnings summary',
          date: new Date().toISOString(),
        },
        ...prev,
      ]
    })
  }, [referralEarnings])


  const value = {
    users,
    currentUser,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    resetPassword,
    userPack,
    setUserPack,
    savedAccount,
    setSavedAccount,
    savedDepositDetails,
    savedWithdrawalDetails,
    saveDepositDetail,
    saveWithdrawalDetail,
    deposits,
    withdrawals,
    walletUsd,
    setWalletUsd,
    addDeposit,
    addWithdrawal,
    activatePack,
    approveDeposit,
    rejectDeposit,
    reverseDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    reverseWithdrawal,
    teamGenerated,
    setTeamGenerated,
    teamCount,
    setTeamCount,
    referralEarnings,
    setReferralEarnings,
    referralCount,
    claimedSalary,
    claimSalary,
    adsViewedToday,
    watchAd,
    hasSecurityPin,
    setSecurityPinForCurrentUser,
    verifySecurityPinForCurrentUser,
    setAdsViewedToday,
    deleteUserAccount,
    earningsHistory,
    setEarningsHistory,
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    PACKS_USD,
    EARN_PER_AD_USD,
    freeAccessForSetup: FREE_ACCESS_FOR_SETUP,
    adVideoIds,
    setAdVideoIds,
    refetchWalletAndDeposits,
    authCheckDone,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

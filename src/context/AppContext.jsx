import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'

const AppContext = createContext(null)

// Set to false when ready to launch (requires pack purchase to watch ads)
const FREE_ACCESS_FOR_SETUP = true

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
const AUTH_USERS_KEY = 'authUsers'
const AUTH_CURRENT_USER_KEY = 'authCurrentUserId'
const AUTH_SESSION_TOKEN_KEY = 'authSessionToken'

function getInitialValue(key, fallback) {
  if (typeof window === 'undefined' || !window.localStorage) return fallback
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
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
  const [users, setUsers] = useState(() => {
    const initial = getInitialValue(AUTH_USERS_KEY, [])
    return Array.isArray(initial) ? initial : []
  })
  const [currentUserId, setCurrentUserId] = useState(() => getInitialValue(AUTH_CURRENT_USER_KEY, null))
  const [userPack, setUserPack] = useState(() => getInitialValue('userPack', null))
  const [savedAccount, setSavedAccount] = useState(() => getInitialValue('savedAccount', null)) // legacy single saved account for compatibility
  const [savedDepositDetails, setSavedDepositDetails] = useState(() => getInitialValue('savedDepositDetails', []))
  const [savedWithdrawalDetails, setSavedWithdrawalDetails] = useState(() => getInitialValue('savedWithdrawalDetails', []))
  const [deposits, setDeposits] = useState(() => getInitialValue('deposits', []))
  const [withdrawals, setWithdrawals] = useState(() => getInitialValue('withdrawals', []))
  const [walletUsd, setWalletUsd] = useState(() => getInitialValue('walletUsd', 0))
  const [teamGenerated, setTeamGenerated] = useState(0) // total generated for platform by team
  const [teamCount, setTeamCount] = useState(0)
  const [securityPins, setSecurityPins] = useState(() => {
    if (typeof window === 'undefined' || !window.localStorage) return {}
    try {
      const raw = window.localStorage.getItem('securityPins')
      const parsed = raw ? JSON.parse(raw) : {}
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  })
  const [remoteHasPin, setRemoteHasPin] = useState(null)
  const [referralEarnings, setReferralEarnings] = useState({ level1: 0, level2: 0, level3: 0 })
  const [claimedSalary, setClaimedSalary] = useState(0)
  const [adsViewedToday, setAdsViewedToday] = useState(0)
  const [earningsHistory, setEarningsHistory] = useState(() => getInitialValue('earningsHistory', []))
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => typeof window !== 'undefined' && window.localStorage?.getItem('adminLoggedIn') === 'true')
  const [adVideoIds, setAdVideoIds] = useState(() => {
    if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_AD_VIDEO_IDS
    const raw = window.localStorage.getItem('adVideoIds')
    if (!raw) return DEFAULT_AD_VIDEO_IDS
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_AD_VIDEO_IDS
      const normalizedUrls = parsed
        .map((item) => String(item || '').trim())
        .filter((item) => /^https?:\/\//i.test(item) && isYouTubeUrl(item))
      return normalizedUrls.length > 0 ? normalizedUrls : DEFAULT_AD_VIDEO_IDS
    } catch {
      return DEFAULT_AD_VIDEO_IDS
    }
  })

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

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('adVideoIds', JSON.stringify(adVideoIds))
    }
  }, [adVideoIds])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      window.localStorage.setItem('securityPins', JSON.stringify(securityPins))
    } catch {
      // ignore
    }
  }, [securityPins])

  useEffect(() => {
    if (!currentUserId) {
      setRemoteHasPin(null)
      return
    }
    const token =
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem(AUTH_SESSION_TOKEN_KEY)
        : null
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
    const token =
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem(AUTH_SESSION_TOKEN_KEY)
        : null
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

  // When authenticated, fetch wallet, deposits, withdrawals, earnings from Supabase
  useEffect(() => {
    const token =
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem(AUTH_SESSION_TOKEN_KEY)
        : null
    if (!currentUserId || !token) return
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch('/api/user/wallet', { headers }).then((r) => r.json()),
      fetch('/api/user/deposits', { headers }).then((r) => r.json()),
      fetch('/api/user/withdrawals', { headers }).then((r) => r.json()),
      fetch('/api/user/earnings', { headers }).then((r) => r.json()),
    ])
      .then(([w, d, wd, e]) => {
        if (w?.ok && w.balanceUsd != null) setWalletUsd(w.balanceUsd)
        if (d?.ok && Array.isArray(d.deposits)) setDeposits(d.deposits)
        if (wd?.ok && Array.isArray(wd.withdrawals)) setWithdrawals(wd.withdrawals)
        if (e?.ok && Array.isArray(e.earnings)) setEarningsHistory(e.earnings)
      })
      .catch(() => {})
  }, [currentUserId])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users))
      window.localStorage.setItem(AUTH_CURRENT_USER_KEY, JSON.stringify(currentUserId))
      window.localStorage.setItem('userPack', JSON.stringify(userPack))
      window.localStorage.setItem('savedAccount', JSON.stringify(savedAccount))
      window.localStorage.setItem('savedDepositDetails', JSON.stringify(savedDepositDetails))
      window.localStorage.setItem('savedWithdrawalDetails', JSON.stringify(savedWithdrawalDetails))
      window.localStorage.setItem('deposits', JSON.stringify(deposits))
      window.localStorage.setItem('withdrawals', JSON.stringify(withdrawals))
      window.localStorage.setItem('walletUsd', JSON.stringify(walletUsd))
      window.localStorage.setItem('earningsHistory', JSON.stringify(earningsHistory))
    }
  }, [currentUserId, deposits, earningsHistory, savedAccount, savedDepositDetails, savedWithdrawalDetails, userPack, users, walletUsd, withdrawals])

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
          ? window.localStorage.getItem(AUTH_SESSION_TOKEN_KEY)
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
        amountUsd: Number(data.pack) || Number(data.amountUsd) || 0,
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
          ? window.localStorage.getItem(AUTH_SESSION_TOKEN_KEY)
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
          ? window.localStorage.getItem(AUTH_SESSION_TOKEN_KEY)
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

  const hasToken = useMemo(() => {
    if (typeof window === 'undefined' || !window.localStorage) return false
    return !!window.localStorage.getItem(AUTH_SESSION_TOKEN_KEY)
  }, [currentUserId])

  const hasSecurityPin = useMemo(() => {
    if (!currentUserId) return false
    if (hasToken) return remoteHasPin === true
    return !!(securityPins[currentUserId])
  }, [currentUserId, hasToken, remoteHasPin, securityPins])

  const setSecurityPinForCurrentUser = useCallback(
    async (pin) => {
      const normalized = String(pin || '').trim()
      if (!currentUserId || !/^\d{4}$/.test(normalized)) return false
      const token =
        typeof window !== 'undefined' && window.localStorage
          ? window.localStorage.getItem(AUTH_SESSION_TOKEN_KEY)
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
            return true
          }
          return false
        } catch {
          return false
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
          ? window.localStorage.getItem(AUTH_SESSION_TOKEN_KEY)
          : null
      if (token) {
        try {
          const res = await fetch('/api/auth/verify-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ pin: normalized }),
          })
          const data = await res.json()
          return !!data?.verified
        } catch {
          return false
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
    if (approvedDeposit?.pack) setUserPack(approvedDeposit.pack)
  }, [])

  const rejectDeposit = useCallback((id) => {
    setDeposits((prev) =>
      prev.map((d) => (d.id === id && d.status === 'pending' ? { ...d, status: 'rejected', rejectedAt: new Date().toISOString() } : d)),
    )
  }, [])

  const reverseDeposit = useCallback((id) => {
    const reversedAt = new Date().toISOString()
    let nextPack = null
    setDeposits((prev) => {
      const updated = prev.map((d) => (d.id === id && d.status === 'approved' ? { ...d, status: 'reversed', reversedAt } : d))
      const latestApproved = updated
        .filter((d) => d.status === 'approved' && d.pack)
        .sort((a, b) => new Date(b.approvedAt || b.date).getTime() - new Date(a.approvedAt || a.date).getTime())[0]
      nextPack = latestApproved?.pack ?? null
      return updated
    })
    setUserPack(nextPack)
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
        ? window.localStorage.getItem(AUTH_SESSION_TOKEN_KEY)
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
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

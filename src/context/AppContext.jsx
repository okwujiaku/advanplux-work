import { createContext, useContext, useState, useCallback, useEffect } from 'react'

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
  'XqNKXOqQaKg',
  'ZgNkU0EgbmY',
  'd3Q1nPjTKs4',
  'JUUMzploWs4',
  'ayunWvACnMU',
  'St1Pkz6MG9U',
  'qlnbJyH2QHI',
  'u1wHZRGXa-A',
  'RuTrQe8lybM',
  'y7SMe1CtwfM',
  'GfbdIycDxeA',
  '6JyxH6fhtao',
  'LyBZisruNZo',
]

const EARN_PER_AD_USD = 0.4

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

export function AppProvider({ children }) {
  const [userPack, setUserPack] = useState(() => getInitialValue('userPack', null))
  const [savedAccount, setSavedAccount] = useState(() => getInitialValue('savedAccount', null)) // legacy single saved account for compatibility
  const [savedDepositDetails, setSavedDepositDetails] = useState(() => getInitialValue('savedDepositDetails', []))
  const [savedWithdrawalDetails, setSavedWithdrawalDetails] = useState(() => getInitialValue('savedWithdrawalDetails', []))
  const [deposits, setDeposits] = useState(() => getInitialValue('deposits', []))
  const [withdrawals, setWithdrawals] = useState(() => getInitialValue('withdrawals', []))
  const [walletUsd, setWalletUsd] = useState(() => getInitialValue('walletUsd', 0))
  const [teamGenerated, setTeamGenerated] = useState(0) // total generated for platform by team
  const [teamCount, setTeamCount] = useState(0)
  const [referralEarnings, setReferralEarnings] = useState({ level1: 0, level2: 0, level3: 0 })
  const [referralCount] = useState({ level1: 0, level2: 0, level3: 0 })
  const [claimedSalary, setClaimedSalary] = useState(0)
  const [adsViewedToday, setAdsViewedToday] = useState(0)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => typeof window !== 'undefined' && window.localStorage?.getItem('adminLoggedIn') === 'true')
  const [adVideoIds, setAdVideoIds] = useState(() => {
    if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_AD_VIDEO_IDS
    const raw = window.localStorage.getItem('adVideoIds')
    if (!raw) return DEFAULT_AD_VIDEO_IDS
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_AD_VIDEO_IDS
    } catch {
      return DEFAULT_AD_VIDEO_IDS
    }
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('adVideoIds', JSON.stringify(adVideoIds))
    }
  }, [adVideoIds])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('userPack', JSON.stringify(userPack))
      window.localStorage.setItem('savedAccount', JSON.stringify(savedAccount))
      window.localStorage.setItem('savedDepositDetails', JSON.stringify(savedDepositDetails))
      window.localStorage.setItem('savedWithdrawalDetails', JSON.stringify(savedWithdrawalDetails))
      window.localStorage.setItem('deposits', JSON.stringify(deposits))
      window.localStorage.setItem('withdrawals', JSON.stringify(withdrawals))
      window.localStorage.setItem('walletUsd', JSON.stringify(walletUsd))
    }
  }, [deposits, savedAccount, savedDepositDetails, savedWithdrawalDetails, userPack, walletUsd, withdrawals])

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

  const saveWithdrawalDetail = useCallback((detail) => {
    if (!detail?.accountNumber?.trim()) return null
    const normalized = {
      id: detail.id || newId('wdacc'),
      currency: detail.currency || 'NGN',
      accountName: detail.accountName?.trim() || '',
      accountNumber: detail.accountNumber.trim(),
      bankName: detail.bankName?.trim() || '',
      createdAt: detail.createdAt || new Date().toISOString(),
    }

    setSavedWithdrawalDetails((prev) => {
      const exists = prev.some((item) =>
        item.currency === normalized.currency &&
        item.accountNumber === normalized.accountNumber &&
        item.accountName === normalized.accountName &&
        item.bankName === normalized.bankName,
      )
      if (exists) return prev
      return [normalized, ...prev]
    })
    return normalized.id
  }, [])

  const addDeposit = useCallback((data) => {
    const now = new Date().toISOString()
    const id = newId('dep')
    const detailToSave = data.saveDetail
      ? {
          country: data.country,
          methodType: data.paymentType,
          accountName: data.accountName,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
        }
      : null

    if (detailToSave) {
      saveDepositDetail(detailToSave)
      setSavedAccount({ country: data.country, accountNumber: data.accountNumber })
    }

    setDeposits((prev) => [
      {
        id,
        userId: data.userId || 'current-user',
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
        date: now,
        status: 'pending',
      },
      ...prev,
    ])
    return id
  }, [saveDepositDetail])

  const addWithdrawal = useCallback((data) => {
    const now = new Date().toISOString()
    const id = newId('wd')
    if (data.saveDetail) {
      saveWithdrawalDetail({
        currency: data.currency,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
      })
    }
    setWithdrawals((prev) => [
      {
        ...data,
        id,
        date: now,
        status: 'pending',
      },
      ...prev,
    ])
    return id
  }, [saveWithdrawalDetail])

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
  }, [])

  const watchAd = useCallback(() => {
    setAdsViewedToday((prev) => prev + 1)
    setWalletUsd((prev) => Number((prev + EARN_PER_AD_USD).toFixed(2)))
  }, [])

  const value = {
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
    setAdsViewedToday,
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

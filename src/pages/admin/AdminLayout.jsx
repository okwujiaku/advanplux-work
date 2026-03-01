import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const DEFAULT_MEMBER = {
  id: 'current-user',
  name: 'Main User',
  email: 'user@advanplux.com',
  phone: '',
  invitationCode: '',
  referredByUserId: '',
  joinedAt: '',
  balance: 0,
  bonusBalance: 0,
  withdrawalLocked: false,
}

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function AdminLayout() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(() => typeof window !== 'undefined' && window.sessionStorage?.getItem('adminLoggedIn') === 'true')
  const [currentAdminEmail, setCurrentAdminEmail] = useState('')

  const [platformBankAccounts, setPlatformBankAccounts] = useState([])
  const [members, setMembers] = useState([DEFAULT_MEMBER])
  const [remoteUsers, setRemoteUsers] = useState([])
  const [bonusWithdrawals, setBonusWithdrawals] = useState([])
  const [giftCodes, setGiftCodes] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [investmentHistory, setInvestmentHistory] = useState([])
  const [adminAccounts, setAdminAccounts] = useState([])

  const [selectedMemberId, setSelectedMemberId] = useState(DEFAULT_MEMBER.id)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [adminDeposits, setAdminDeposits] = useState([])

  const {
    users,
    deposits,
    withdrawals,
    adVideoIds,
    setAdVideoIds,
    deleteUserAccount,
    approveDeposit,
    rejectDeposit,
    reverseDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    reverseWithdrawal,
    setIsAdminLoggedIn,
  } = useApp()

  useEffect(() => {
    const controller = new AbortController()
    const loadRemoteUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', { signal: controller.signal })
        const payload = await response.json()
        if (response.ok && payload?.ok && Array.isArray(payload.users)) {
          setRemoteUsers(payload.users)
        }
      } catch {
        // Keep existing local users when backend is unavailable.
      }
    }
    loadRemoteUsers()
    return () => controller.abort()
  }, [])

  const getAdminKey = () =>
    (typeof window !== 'undefined' && window.sessionStorage?.getItem('adminApiKey')) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_SECRET) ||
    ''

  useEffect(() => {
    if (!loggedIn) return
    const controller = new AbortController()
    const key = getAdminKey()
    const loadAdminDeposits = async () => {
      try {
        const response = await fetch('/api/admin/deposits', {
          signal: controller.signal,
          headers: key ? { 'X-Admin-Key': key } : {},
        })
        const payload = await response.json()
        if (response.ok && payload?.ok && Array.isArray(payload.deposits)) {
          setAdminDeposits(payload.deposits)
        } else {
          setAdminDeposits([])
        }
      } catch {
        setAdminDeposits([])
      }
    }
    loadAdminDeposits()
    return () => controller.abort()
  }, [loggedIn])

  useEffect(() => {
    if (!loggedIn) return
    const controller = new AbortController()
    const key = getAdminKey()
    const loadPlatformBankAccounts = async () => {
      try {
        const response = await fetch('/api/admin/platform-bank-accounts', {
          signal: controller.signal,
          headers: key ? { 'X-Admin-Key': key } : {},
        })
        const payload = await response.json()
        if (response.ok && payload?.ok && Array.isArray(payload.accounts)) {
          setPlatformBankAccounts(payload.accounts)
        }
      } catch {
        // keep existing state if backend unavailable
      }
    }
    loadPlatformBankAccounts()
    return () => controller.abort()
  }, [loggedIn])

  useEffect(() => {
    if (!loggedIn) return
    const controller = new AbortController()
    const key = getAdminKey()
    const headers = key ? { 'X-Admin-Key': key } : {}
    const load = async () => {
      try {
        const [g, a, b, i, ad] = await Promise.all([
          fetch('/api/admin/gift-codes', { signal: controller.signal, headers }).then((r) => r.json()),
          fetch('/api/admin/announcements', { signal: controller.signal, headers }).then((r) => r.json()),
          fetch('/api/admin/bonus-withdrawals', { signal: controller.signal, headers }).then((r) => r.json()),
          fetch('/api/admin/investment-history', { signal: controller.signal, headers }).then((r) => r.json()),
          fetch('/api/admin/admin-users', { signal: controller.signal, headers }).then((r) => r.json()),
        ])
        if (g?.ok && Array.isArray(g.giftCodes)) setGiftCodes(g.giftCodes)
        if (a?.ok && Array.isArray(a.announcements)) setAnnouncements(a.announcements)
        if (b?.ok && Array.isArray(b.bonusWithdrawals)) setBonusWithdrawals(b.bonusWithdrawals)
        if (i?.ok && Array.isArray(i.investmentHistory)) setInvestmentHistory(i.investmentHistory)
        if (ad?.ok && Array.isArray(ad.adminAccounts)) setAdminAccounts(ad.adminAccounts)
      } catch {
        // keep defaults
      }
    }
    load()
    return () => controller.abort()
  }, [loggedIn])

  const depositsForAdmin = adminDeposits.length > 0 ? adminDeposits : deposits

  useEffect(() => {
    const normalizedRemoteUsers = remoteUsers.map((user) => ({
      id: user.id,
      email: user.email || '',
      phone: user.phone || '',
      myInvitationCode: user.invitationCode || '',
      referredByUserId: user.referredByUserId || '',
      createdAt: user.createdAt || '',
    }))
    const allUsers = [...users, ...normalizedRemoteUsers]
    const authUserById = new Map(allUsers.map((user) => [user.id, user]))
    const ids = new Set([DEFAULT_MEMBER.id, ...allUsers.map((user) => user.id), ...depositsForAdmin.map((d) => d.userId), ...withdrawals.map((w) => w.userId)])
    setMembers((prev) => {
      let changed = false
      const next = [...prev]
      ids.forEach((id) => {
        if (!next.some((m) => m.id === id)) {
          const authUser = authUserById.get(id)
          const derivedName = authUser?.email ? authUser.email.split('@')[0] : id
          changed = true
          next.push({
            id,
            name: id === DEFAULT_MEMBER.id ? DEFAULT_MEMBER.name : derivedName,
            email: authUser?.email || `${id}@advanplux.com`,
            phone: authUser?.phone || '',
            invitationCode: authUser?.myInvitationCode || '',
            referredByUserId: authUser?.referredByUserId || '',
            joinedAt: authUser?.createdAt || '',
            balance: 0,
            bonusBalance: 0,
            withdrawalLocked: false,
          })
        }
      })
      const merged = next.map((member) => {
        const authUser = authUserById.get(member.id)
        if (!authUser) return member
        const updatedMember = {
          ...member,
          email: authUser.email || member.email,
          phone: authUser.phone || '',
          invitationCode: authUser.myInvitationCode || '',
          referredByUserId: authUser.referredByUserId || '',
          joinedAt: authUser.createdAt || member.joinedAt || '',
        }
        if (
          updatedMember.email !== member.email ||
          updatedMember.phone !== member.phone ||
          updatedMember.invitationCode !== member.invitationCode ||
          updatedMember.referredByUserId !== member.referredByUserId ||
          updatedMember.joinedAt !== member.joinedAt
        ) {
          changed = true
          return updatedMember
        }
        return member
      })
      return changed ? merged : prev
    })
  }, [depositsForAdmin, remoteUsers, users, withdrawals])

  const editableMembers = useMemo(
    () => members.filter((member) => member.id !== DEFAULT_MEMBER.id),
    [members],
  )

  const selectedMember = useMemo(() => {
    const match = members.find((member) => member.id === selectedMemberId)
    if (match && match.id !== DEFAULT_MEMBER.id) return match
    if (editableMembers.length > 0) return editableMembers[0]
    return DEFAULT_MEMBER
  }, [editableMembers, members, selectedMemberId])

  const pendingDepositsCount = depositsForAdmin.filter((d) => d.status === 'pending').length
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length
  const pendingBonusWithdrawalsCount = bonusWithdrawals.filter((w) => w.status === 'pending').length

  const approveDepositAdmin = async (id) => {
    const key = getAdminKey()
    if (!key) {
      alert('Admin key missing. Balance will not be credited. Set ADMIN_SECRET in Vercel and VITE_ADMIN_SECRET (or sessionStorage adminApiKey) so approval hits the backend and credits the user\'s wallet.')
      return
    }
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': key },
        body: JSON.stringify({ id, status: 'approved' }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok && data.deposit) {
        setAdminDeposits((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: 'approved', approvedAt: data.deposit.approvedAt } : d)),
        )
        if (data.creditedAmountUsd != null) {
          alert(`Approved. User balance credited: $${Number(data.creditedAmountUsd).toFixed(2)}. New balance: $${Number(data.newBalanceUsd).toFixed(2)}`)
        }
        return
      }
      const msg = data?.error || `Request failed (${res.status}). User balance was not credited.`
      alert(msg)
    } catch {
      alert('Network error. Approval did not reach the server. User balance was not credited.')
    }
  }

  const rejectDepositAdmin = async (id) => {
    const key = getAdminKey()
    if (!key) {
      alert('Admin key missing. Set ADMIN_SECRET in Vercel and sessionStorage adminApiKey (or VITE_ADMIN_SECRET).')
      return
    }
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': key },
        body: JSON.stringify({ id, status: 'rejected' }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok && data.deposit) {
        setAdminDeposits((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: 'rejected', rejectedAt: data.deposit.rejectedAt } : d)),
        )
        return
      }
      alert(data?.error || `Reject failed (${res.status}).`)
    } catch {
      alert('Network error. Reject did not reach the server.')
    }
  }

  const menuItems = [
    { to: '/admin/users', icon: '🏠', label: 'Registered Members', count: members.length },
    { to: '/admin/add-bank', icon: '➕', label: 'Add Bank Account' },
    { to: '/admin/edit-users', icon: '✏️', label: 'Edit Users Info.', count: members.length },
    { to: '/admin/deposits', icon: '$', label: 'Confirm Pending Deposit', count: pendingDepositsCount },
    { to: '/admin/withdrawals', icon: '📥', label: 'Members withdrawals', count: pendingWithdrawalsCount },
    { to: '/admin/gift-code', icon: '🎁', label: 'Generate Gift Code' },
    { to: '/admin/video-manager', icon: '🎬', label: 'Video Manager', count: adVideoIds.length },
    { to: '/admin/account-topup', icon: '➕', label: 'Account Top up' },
    { to: '/admin/deduct-account', icon: '➖', label: 'Deduct Account' },
    { to: '/admin/lock-withdrawal', icon: '⊘', label: 'Lock/Unlock Withdrawal' },
    { to: '/admin/purchased-history', icon: '⊘', label: 'Purchase Engine History' },
    { to: '/admin/register-admin', icon: '👥', label: 'Register Admin' },
    { to: '/admin/change-password', icon: '🔒', label: 'Change Password' },
    { to: '/admin/announcement', icon: '🔔', label: 'Make Announcement' },
    { to: '/admin/deposit-history', icon: '↻', label: 'Deposit History' },
    { to: '/admin/withdrawal-history', icon: '↻', label: 'Withdrawal History', count: withdrawals.length },
  ]

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) {
        setLoggedIn(true)
        setCurrentAdminEmail(email.trim().toLowerCase())
        setIsAdminLoggedIn(true)
        if (typeof window !== 'undefined' && window.sessionStorage) window.sessionStorage.setItem('adminLoggedIn', 'true')
      } else {
        alert(data?.error || 'Invalid email or password. Only admin has access.')
      }
    } catch {
      alert('Login failed. Check your connection and try again.')
    }
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setCurrentAdminEmail('')
    setIsAdminLoggedIn(false)
    if (typeof window !== 'undefined' && window.sessionStorage) window.sessionStorage.removeItem('adminLoggedIn')
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const updateMember = (memberId, updater) => {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? updater(m) : m)))
  }

  const submitBankAccount = async (form) => {
    if (!form.bankName || !form.accountName || !form.accountNumber) return
    const key = getAdminKey()
    try {
      const response = await fetch('/api/admin/platform-bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Admin-Key': key } : {}) },
        body: JSON.stringify({
          bankName: form.bankName,
          accountName: form.accountName,
          accountNumber: form.accountNumber,
          currency: form.currency || 'USD',
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok && data?.ok && data?.account) {
        setPlatformBankAccounts((prev) => [data.account, ...prev])
        return
      }
    } catch {
      // fallback to local only if backend fails
    }
    setPlatformBankAccounts((prev) => [{ ...form, id: newId('bank'), createdAt: new Date().toISOString() }, ...prev])
  }

  const deleteBankAccount = async (bankAccountId) => {
    if (!bankAccountId) return
    const key = getAdminKey()
    try {
      const response = await fetch(`/api/admin/platform-bank-accounts?id=${encodeURIComponent(bankAccountId)}`, {
        method: 'DELETE',
        headers: key ? { 'X-Admin-Key': key } : {},
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok && data?.ok) {
        setPlatformBankAccounts((prev) => prev.filter((account) => account.id !== bankAccountId))
        return
      }
    } catch {
      // fallback to local only if backend fails
    }
    setPlatformBankAccounts((prev) => prev.filter((account) => account.id !== bankAccountId))
  }

  const saveMemberEdits = (memberId, payload) => {
    updateMember(memberId, (m) => ({
      ...m,
      name: payload.name.trim() || m.name,
      email: payload.email.trim() || m.email,
      phone: (payload.phone || '').trim() || m.phone,
    }))
  }

  const applyWalletChange = async (form, mode, source) => {
    const amount = Number(form.amount)
    if (!form.memberId || !amount || amount <= 0) return
    const key = getAdminKey()
    const addUsd = mode === 'add' ? amount : -amount
    try {
      const res = await fetch('/api/admin/user-wallet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Admin-Key': key } : {}) },
        body: JSON.stringify({ userId: form.memberId, addUsd, type: source }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) {
        updateMember(form.memberId, (m) => {
          const nextBalance = mode === 'add' ? m.balance + amount : Math.max(0, m.balance - amount)
          return { ...m, balance: nextBalance }
        })
        setInvestmentHistory((prev) => [
          { id: newId('hist'), type: source, memberId: form.memberId, amount, date: new Date().toISOString() },
          ...prev,
        ])
        return
      }
    } catch {
      // fallback local
    }
    updateMember(form.memberId, (m) => {
      const nextBalance = mode === 'add' ? m.balance + amount : Math.max(0, m.balance - amount)
      return { ...m, balance: nextBalance }
    })
    setInvestmentHistory((prev) => [
      { id: newId('hist'), type: source, memberId: form.memberId, amount, date: new Date().toISOString() },
      ...prev,
    ])
  }

  const createBonusWithdrawal = async (payload) => {
    const amount = Number(payload.amount)
    if (!payload.memberId || !amount || amount <= 0) return
    const key = getAdminKey()
    try {
      const res = await fetch('/api/admin/bonus-withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Admin-Key': key } : {}) },
        body: JSON.stringify({ memberId: payload.memberId, amount, accountNumber: payload.accountNumber || null }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok && data.bonusWithdrawal) {
        setBonusWithdrawals((prev) => [data.bonusWithdrawal, ...prev])
        return
      }
    } catch {
      // fallback local
    }
    setBonusWithdrawals((prev) => [
      {
        id: newId('bwd'),
        userId: payload.memberId,
        amount,
        accountNumber: payload.accountNumber || '',
        status: 'pending',
        date: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  const approveBonusWithdrawal = async (id) => {
    const key = getAdminKey()
    try {
      const res = await fetch('/api/admin/bonus-withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Admin-Key': key } : {}) },
        body: JSON.stringify({ id, status: 'approved' }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) {
        setBonusWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'approved' } : w)))
        return
      }
    } catch {
      // fallback local
    }
    setBonusWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'approved' } : w)))
  }

  const generateGiftCode = async (payload) => {
    const value = Number(payload.value)
    if (!value || value <= 0) return
    const key = getAdminKey()
    try {
      const res = await fetch('/api/admin/gift-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Admin-Key': key } : {}) },
        body: JSON.stringify({ value }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok && data.giftCode) {
        setGiftCodes((prev) => [data.giftCode, ...prev])
        return
      }
    } catch {
      // fallback local
    }
    setGiftCodes((prev) => [
      { id: newId('gift'), code: `GIFT-${Date.now().toString(36).toUpperCase()}`, value, createdAt: new Date().toISOString() },
      ...prev,
    ])
  }

  const registerAdmin = async (payload) => {
    const newEmail = payload.email.trim().toLowerCase()
    const newPassword = payload.password.trim()
    if (!newEmail || !newPassword) return
    if (adminAccounts.some((admin) => admin.email.toLowerCase() === newEmail)) return
    const key = getAdminKey()
    try {
      const res = await fetch('/api/admin/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Admin-Key': key } : {}) },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) {
        setAdminAccounts((prev) => [...prev, { email: newEmail }])
        return
      }
    } catch {
      // fallback local
    }
    setAdminAccounts((prev) => [...prev, { email: newEmail }])
  }

  const changePassword = async (payload) => {
    const key = getAdminKey()
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Admin-Key': key } : {}) },
        body: JSON.stringify({
          email: currentAdminEmail,
          oldPassword: payload.oldPassword,
          newPassword: payload.newPassword?.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      return !!(res.ok && data?.ok)
    } catch {
      return false
    }
  }

  const postAnnouncement = async (text) => {
    const value = text.trim()
    if (!value) return
    const key = getAdminKey()
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Admin-Key': key } : {}) },
        body: JSON.stringify({ text: value }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok && data.announcement) {
        setAnnouncements((prev) => [data.announcement, ...prev])
        return
      }
    } catch {
      // fallback local
    }
    setAnnouncements((prev) => [{ id: newId('ann'), text: value, date: new Date().toISOString() }, ...prev])
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin login</h1>
          <p className="text-sm text-gray-500 mb-4">Restricted access. Use admin email and password.</p>
          <form onSubmit={handleLogin}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4" />
            <button type="submit" className="w-full py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">Enter</button>
          </form>
        </div>
      </div>
    )
  }

  const contextValue = {
    members,
    selectedMember,
    selectedMemberId,
    setSelectedMemberId,
    updateMember,
    platformBankAccounts,
    bonusWithdrawals,
    giftCodes,
    announcements,
    investmentHistory,
    adminAccounts,
    deposits: depositsForAdmin,
    withdrawals,
    approveDeposit: approveDepositAdmin,
    rejectDeposit: rejectDepositAdmin,
    reverseDeposit: () => {},
    approveWithdrawal,
    rejectWithdrawal,
    reverseWithdrawal,
    submitBankAccount,
    deleteBankAccount,
    saveMemberEdits,
    applyWalletChange,
    createBonusWithdrawal,
    approveBonusWithdrawal,
    generateGiftCode,
    adVideoIds,
    setAdVideoIds,
    deleteUserAccount,
    registerAdmin,
    changePassword,
    postAnnouncement,
  }

  return (
    <div className="h-screen bg-[#eaf1f7] overflow-hidden">
      <header className="h-16 text-white border-b border-[#2b607f]" style={{ backgroundColor: '#143D59' }}>
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded border border-white/30 text-white hover:bg-white/10"
              aria-label="Toggle admin menu"
            >
              <span className="text-lg leading-none">☰</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2EC4B6]">Advanplux</h1>
          </div>
          <div className="text-right">
            <p className="font-semibold">Welcome Admin</p>
            <div className="flex gap-2 justify-end mt-1">
              <Link to="/dashboard" className="text-xs px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10">Dashboard</Link>
              <Link to="/dashboard/watch" className="text-xs px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10">Watch & Earn</Link>
              <button onClick={handleLogout} className="text-xs px-3 py-1 rounded border border-red-300 text-red-100 hover:bg-red-700/30">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="h-[calc(100vh-4rem)] flex relative">
        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close admin menu backdrop"
            onClick={closeMobileMenu}
            className="lg:hidden absolute inset-0 bg-black/30 z-30"
          />
        )}

        <aside
          className={`w-[280px] shrink-0 border-r border-[#2b607f] text-white overflow-y-auto z-40 transition-transform duration-200 fixed lg:static top-16 bottom-0 left-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ backgroundColor: '#143D59' }}
        >
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded border text-sm font-medium transition-colors ${
                    isActive ? 'text-[#2EC4B6] border-[#2EC4B6] bg-[#1B4965]' : 'text-white border-[#2b607f] hover:bg-[#1B4965]'
                  }`
                }
              >
                <span className="inline-flex items-center gap-1">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {typeof item.count === 'number' && <span className="text-yellow-300">{item.count}</span>}
                </span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 w-full">
          <Outlet context={contextValue} />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

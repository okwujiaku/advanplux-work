import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const ADMIN_EMAIL = 'brunerlisa555@gmail.com'
const ADMIN_PASSWORD = 'advanplux2026'

const DEFAULT_MEMBER = {
  id: 'current-user',
  name: 'Main User',
  email: 'user@advanplux.com',
  balance: 0,
  bonusBalance: 0,
  withdrawalLocked: false,
}

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

function AdminLayout() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(() => typeof window !== 'undefined' && window.localStorage?.getItem('adminLoggedIn') === 'true')
  const [currentAdminEmail, setCurrentAdminEmail] = useState('')

  const [platformBankAccounts, setPlatformBankAccounts] = useState(() => getInitialValue('platformBankAccounts', []))
  const [members, setMembers] = useState(() => getInitialValue('adminMembers', [DEFAULT_MEMBER]))
  const [bonusWithdrawals, setBonusWithdrawals] = useState(() => getInitialValue('bonusWithdrawals', []))
  const [giftCodes, setGiftCodes] = useState(() => getInitialValue('giftCodes', []))
  const [announcements, setAnnouncements] = useState(() => getInitialValue('announcements', []))
  const [investmentHistory, setInvestmentHistory] = useState(() => getInitialValue('investmentHistory', []))
  const [adminAccounts, setAdminAccounts] = useState(() => getInitialValue('adminAccounts', [{ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }]))

  const [selectedMemberId, setSelectedMemberId] = useState(DEFAULT_MEMBER.id)

  const {
    deposits,
    withdrawals,
    approveDeposit,
    rejectDeposit,
    reverseDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    reverseWithdrawal,
    setIsAdminLoggedIn,
  } = useApp()

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem('platformBankAccounts', JSON.stringify(platformBankAccounts))
  }, [platformBankAccounts])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem('adminMembers', JSON.stringify(members))
  }, [members])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem('bonusWithdrawals', JSON.stringify(bonusWithdrawals))
  }, [bonusWithdrawals])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem('giftCodes', JSON.stringify(giftCodes))
  }, [giftCodes])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem('announcements', JSON.stringify(announcements))
  }, [announcements])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem('investmentHistory', JSON.stringify(investmentHistory))
  }, [investmentHistory])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem('adminAccounts', JSON.stringify(adminAccounts))
  }, [adminAccounts])

  useEffect(() => {
    const ids = new Set([DEFAULT_MEMBER.id, ...deposits.map((d) => d.userId), ...withdrawals.map((w) => w.userId)])
    setMembers((prev) => {
      let changed = false
      const next = [...prev]
      ids.forEach((id) => {
        if (!next.some((m) => m.id === id)) {
          changed = true
          next.push({
            id,
            name: id === DEFAULT_MEMBER.id ? DEFAULT_MEMBER.name : id,
            email: `${id}@advanplux.com`,
            balance: 0,
            bonusBalance: 0,
            withdrawalLocked: false,
          })
        }
      })
      return changed ? next : prev
    })
  }, [deposits, withdrawals])

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId) || members[0] || DEFAULT_MEMBER,
    [members, selectedMemberId],
  )

  const pendingDepositsCount = deposits.filter((d) => d.status === 'pending').length
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length
  const pendingBonusWithdrawalsCount = bonusWithdrawals.filter((w) => w.status === 'pending').length
  const menuItems = [
    { to: '/admin/users', icon: '🏠', label: 'Registered Members', count: members.length },
    { to: '/admin/add-bank', icon: '➕', label: 'Add Bank Account' },
    { to: '/admin/edit-users', icon: '✏️', label: 'Edit Users Info.', count: members.length },
    { to: '/admin/deposits', icon: '$', label: 'Confirm Pending Deposit', count: pendingDepositsCount },
    { to: '/admin/withdrawals', icon: '📥', label: 'Members withdrawals', count: pendingWithdrawalsCount },
    { to: '/admin/bonus-withdrawals', icon: '📥', label: 'Bonus withdrawals', count: pendingBonusWithdrawalsCount },
    { to: '/admin/gift-code', icon: '🎁', label: 'Generate Gift Code' },
    { to: '/admin/account-topup', icon: '➕', label: 'Account Top up' },
    { to: '/admin/deduct-account', icon: '➖', label: 'Deduct Account' },
    { to: '/admin/lock-withdrawal', icon: '⊘', label: 'Lock/Unlock Withdrawal' },
    { to: '/admin/purchased-history', icon: '⊘', label: 'Purchase Engine History' },
    { to: '/admin/register-admin', icon: '👥', label: 'Register Admin' },
    { to: '/admin/change-password', icon: '🔒', label: 'Change Password' },
    { to: '/admin/announcement', icon: '🔔', label: 'Make Announcement' },
    { to: '/admin/investment-history', icon: '↻', label: 'Investment History', count: investmentHistory.length },
    { to: '/admin/deposit-history', icon: '↻', label: 'Deposit History' },
    { to: '/admin/withdrawal-history', icon: '↻', label: 'Withdrawal History', count: withdrawals.length },
    { to: '/admin/bonus-history', icon: '↻', label: 'Bonus Withdrawal History', count: bonusWithdrawals.length },
  ]

  const handleLogin = (e) => {
    e.preventDefault()
    const account = adminAccounts.find((admin) => admin.email.toLowerCase() === email.trim().toLowerCase())
    if (account && account.password === password) {
      setLoggedIn(true)
      setCurrentAdminEmail(account.email)
      setIsAdminLoggedIn(true)
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('adminLoggedIn', 'true')
    } else {
      alert('Invalid email or password. Only admin has access.')
    }
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setCurrentAdminEmail('')
    setIsAdminLoggedIn(false)
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem('adminLoggedIn')
  }

  const updateMember = (memberId, updater) => {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? updater(m) : m)))
  }

  const submitBankAccount = (form) => {
    if (!form.bankName || !form.accountName || !form.accountNumber) return
    setPlatformBankAccounts((prev) => [{ ...form, id: newId('bank'), createdAt: new Date().toISOString() }, ...prev])
  }

  const saveMemberEdits = (memberId, payload) => {
    updateMember(memberId, (m) => ({ ...m, name: payload.name.trim() || m.name, email: payload.email.trim() || m.email }))
  }

  const applyWalletChange = (form, mode, source) => {
    const amount = Number(form.amount)
    if (!form.memberId || !amount || amount <= 0) return
    updateMember(form.memberId, (m) => {
      const nextBalance = mode === 'add' ? m.balance + amount : Math.max(0, m.balance - amount)
      return { ...m, balance: nextBalance }
    })
    setInvestmentHistory((prev) => [
      { id: newId('hist'), type: source, memberId: form.memberId, amount, date: new Date().toISOString() },
      ...prev,
    ])
  }

  const createBonusWithdrawal = (payload) => {
    const amount = Number(payload.amount)
    if (!payload.memberId || !payload.accountNumber || !amount || amount <= 0) return
    setBonusWithdrawals((prev) => [
      {
        id: newId('bwd'),
        userId: payload.memberId,
        amount,
        currency: 'NGN',
        accountNumber: payload.accountNumber,
        status: 'pending',
        date: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  const approveBonusWithdrawal = (id) => {
    setBonusWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'approved' } : w)))
  }

  const generateGiftCode = (payload) => {
    const value = Number(payload.value)
    if (!value || value <= 0) return
    const code = `GIFT-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    setGiftCodes((prev) => [{ id: newId('gift'), code, value, note: payload.note, createdAt: new Date().toISOString() }, ...prev])
  }

  const registerAdmin = (payload) => {
    const newEmail = payload.email.trim().toLowerCase()
    const newPassword = payload.password.trim()
    if (!newEmail || !newPassword) return
    if (adminAccounts.some((admin) => admin.email.toLowerCase() === newEmail)) return
    setAdminAccounts((prev) => [...prev, { email: newEmail, password: newPassword }])
  }

  const changePassword = (payload) => {
    const activeAdmin = adminAccounts.find((admin) => admin.email === currentAdminEmail) || adminAccounts[0]
    if (!activeAdmin) return false
    if (payload.oldPassword !== activeAdmin.password) return false
    if (!payload.newPassword.trim()) return false
    setAdminAccounts((prev) =>
      prev.map((admin) => (admin.email === activeAdmin.email ? { ...admin, password: payload.newPassword.trim() } : admin)),
    )
    return true
  }

  const postAnnouncement = (text) => {
    const value = text.trim()
    if (!value) return
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
    deposits,
    withdrawals,
    approveDeposit,
    rejectDeposit,
    reverseDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    reverseWithdrawal,
    submitBankAccount,
    saveMemberEdits,
    applyWalletChange,
    createBonusWithdrawal,
    approveBonusWithdrawal,
    generateGiftCode,
    registerAdmin,
    changePassword,
    postAnnouncement,
  }

  return (
    <div className="h-screen bg-[#eaf1f7] overflow-hidden">
      <header className="h-16 text-white border-b border-[#2b607f]" style={{ backgroundColor: '#143D59' }}>
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#2EC4B6]">Advanplux</h1>
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

      <div className="h-[calc(100vh-4rem)] flex">
        <aside className="w-[260px] shrink-0 border-r border-[#2b607f] text-white overflow-y-auto" style={{ backgroundColor: '#143D59' }}>
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet context={contextValue} />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

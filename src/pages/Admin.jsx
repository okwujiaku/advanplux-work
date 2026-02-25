import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

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

const MENU_ITEMS = [
  { key: 'members', label: 'Registered Members' },
  { key: 'add-bank', label: 'Add Bank Account' },
  { key: 'edit-users', label: 'Edit Users Info.' },
  { key: 'pending-deposits', label: 'Confirm Pending Deposit' },
  { key: 'members-withdrawals', label: 'Members withdrawals' },
  { key: 'bonus-withdrawals', label: 'Bonus withdrawals' },
  { key: 'gift-code', label: 'Generate Gift Code' },
  { key: 'account-topup', label: 'Account Top up' },
  { key: 'deduct-account', label: 'Deduct Account' },
  { key: 'lock-withdrawal', label: 'Lock/Unlock Withdrawal' },
  { key: 'purchased-history', label: 'Purchased engine history' },
  { key: 'register-admin', label: 'Register Admin' },
  { key: 'change-password', label: 'Change Password' },
  { key: 'announcement', label: 'Make Announcement' },
  { key: 'investment-history', label: 'Investment History' },
  { key: 'deposit-history', label: 'Deposit History' },
  { key: 'withdrawal-history', label: 'Withdrawal History' },
  { key: 'bonus-history', label: 'Bonus Withdrawal History' },
]

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

function Admin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(() => typeof window !== 'undefined' && window.localStorage?.getItem('adminLoggedIn') === 'true')
  const [currentAdminEmail, setCurrentAdminEmail] = useState('')
  const [activeMenu, setActiveMenu] = useState('members')

  const [platformBankAccounts, setPlatformBankAccounts] = useState(() => getInitialValue('platformBankAccounts', []))
  const [members, setMembers] = useState(() => getInitialValue('adminMembers', [DEFAULT_MEMBER]))
  const [bonusWithdrawals, setBonusWithdrawals] = useState(() => getInitialValue('bonusWithdrawals', []))
  const [giftCodes, setGiftCodes] = useState(() => getInitialValue('giftCodes', []))
  const [announcements, setAnnouncements] = useState(() => getInitialValue('announcements', []))
  const [investmentHistory, setInvestmentHistory] = useState(() => getInitialValue('investmentHistory', []))
  const [adminAccounts, setAdminAccounts] = useState(() =>
    getInitialValue('adminAccounts', [{ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }]),
  )

  const [selectedMemberId, setSelectedMemberId] = useState(DEFAULT_MEMBER.id)
  const [bankForm, setBankForm] = useState({ bankName: '', accountName: '', accountNumber: '', currency: 'USD' })
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [topupForm, setTopupForm] = useState({ memberId: DEFAULT_MEMBER.id, amount: '' })
  const [deductForm, setDeductForm] = useState({ memberId: DEFAULT_MEMBER.id, amount: '' })
  const [bonusWithdrawalForm, setBonusWithdrawalForm] = useState({ memberId: DEFAULT_MEMBER.id, amount: '', accountNumber: '' })
  const [giftForm, setGiftForm] = useState({ value: '', note: '' })
  const [announcementText, setAnnouncementText] = useState('')
  const [registerAdminForm, setRegisterAdminForm] = useState({ email: '', password: '' })
  const [changePasswordForm, setChangePasswordForm] = useState({ oldPassword: '', newPassword: '' })

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

  useEffect(() => {
    if (selectedMember) setEditForm({ name: selectedMember.name, email: selectedMember.email })
  }, [selectedMember])

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

  const submitBankAccount = (e) => {
    e.preventDefault()
    if (!bankForm.bankName || !bankForm.accountName || !bankForm.accountNumber) return
    setPlatformBankAccounts((prev) => [{ ...bankForm, id: newId('bank'), createdAt: new Date().toISOString() }, ...prev])
    setBankForm({ bankName: '', accountName: '', accountNumber: '', currency: 'USD' })
  }

  const saveMemberEdits = (e) => {
    e.preventDefault()
    if (!selectedMember) return
    updateMember(selectedMember.id, (m) => ({ ...m, name: editForm.name.trim() || m.name, email: editForm.email.trim() || m.email }))
  }

  const applyWalletChange = (form, mode, source) => {
    const amount = Number(form.amount)
    if (!form.memberId || !amount || amount <= 0) return
    updateMember(form.memberId, (m) => {
      const nextBalance = mode === 'add' ? m.balance + amount : Math.max(0, m.balance - amount)
      return { ...m, balance: nextBalance }
    })
    setInvestmentHistory((prev) => [
      {
        id: newId('hist'),
        type: source,
        memberId: form.memberId,
        amount,
        date: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  const createBonusWithdrawal = (e) => {
    e.preventDefault()
    const amount = Number(bonusWithdrawalForm.amount)
    if (!bonusWithdrawalForm.memberId || !bonusWithdrawalForm.accountNumber || !amount || amount <= 0) return
    setBonusWithdrawals((prev) => [
      {
        id: newId('bwd'),
        userId: bonusWithdrawalForm.memberId,
        amount,
        currency: 'NGN',
        accountNumber: bonusWithdrawalForm.accountNumber,
        status: 'pending',
        date: new Date().toISOString(),
      },
      ...prev,
    ])
    setBonusWithdrawalForm((prev) => ({ ...prev, amount: '', accountNumber: '' }))
  }

  const approveBonusWithdrawal = (id) => {
    setBonusWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'approved' } : w)))
  }

  const generateGiftCode = (e) => {
    e.preventDefault()
    const value = Number(giftForm.value)
    if (!value || value <= 0) return
    const code = `GIFT-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    setGiftCodes((prev) => [{ id: newId('gift'), code, value, note: giftForm.note, createdAt: new Date().toISOString() }, ...prev])
    setGiftForm({ value: '', note: '' })
  }

  const registerAdmin = (e) => {
    e.preventDefault()
    const newEmail = registerAdminForm.email.trim().toLowerCase()
    const newPassword = registerAdminForm.password.trim()
    if (!newEmail || !newPassword) return
    if (adminAccounts.some((admin) => admin.email.toLowerCase() === newEmail)) return
    setAdminAccounts((prev) => [...prev, { email: newEmail, password: newPassword }])
    setRegisterAdminForm({ email: '', password: '' })
  }

  const changePassword = (e) => {
    e.preventDefault()
    const activeAdmin = adminAccounts.find((admin) => admin.email === currentAdminEmail) || adminAccounts[0]
    if (!activeAdmin) return
    if (changePasswordForm.oldPassword !== activeAdmin.password) return
    if (!changePasswordForm.newPassword.trim()) return
    setAdminAccounts((prev) =>
      prev.map((admin) => (admin.email === activeAdmin.email ? { ...admin, password: changePasswordForm.newPassword.trim() } : admin)),
    )
    setChangePasswordForm({ oldPassword: '', newPassword: '' })
  }

  const postAnnouncement = (e) => {
    e.preventDefault()
    const text = announcementText.trim()
    if (!text) return
    setAnnouncements((prev) => [{ id: newId('ann'), text, date: new Date().toISOString() }, ...prev])
    setAnnouncementText('')
  }

  const pendingDeposits = deposits.filter((d) => d.status === 'pending')
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending')
  const pendingBonusWithdrawals = bonusWithdrawals.filter((w) => w.status === 'pending')
  const purchasedHistory = deposits.filter((d) => d.status === 'approved' && d.pack)

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin login</h1>
          <p className="text-sm text-gray-500 mb-4">Restricted access. Use admin email and password.</p>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
            />
            <button type="submit" className="w-full py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eaf1f7]" style={{ opacity: 1 }}>
      <header className="text-white border-b-2 border-orange-500" style={{ backgroundColor: '#143D59', opacity: 1 }}>
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#2EC4B6]">Advanplux</h1>
          <div className="text-right">
            <p className="font-semibold text-lg">Welcome Admin</p>
            <div className="flex gap-2 justify-end mt-1">
              <Link to="/dashboard" className="text-xs px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10">Dashboard</Link>
              <Link to="/dashboard/watch" className="text-xs px-3 py-1 rounded border border-white/20 text-white hover:bg-white/10">Watch & Earn</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row items-start gap-4 p-3 md:p-4">
        <aside
          className="w-full md:w-72 md:shrink-0 text-white border border-[#1B4965] rounded-lg overflow-hidden"
          style={{ backgroundColor: '#143D59', opacity: 1 }}
        >
          <div className="p-3 space-y-1">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveMenu(item.key)}
                className={`w-full text-left px-3 py-2 rounded border text-sm font-medium transition-colors ${
                  activeMenu === item.key ? 'text-[#2EC4B6] border-[#2EC4B6]' : 'text-white border-[#2b607f]'
                }`}
                style={{ backgroundColor: activeMenu === item.key ? '#1B4965' : '#143D59' }}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded border text-sm font-medium text-red-200 hover:text-white"
              style={{ backgroundColor: '#143D59', borderColor: '#7f1d1d' }}
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="w-full md:flex-1 min-h-[70vh] bg-[#eef5fb] border border-[#c5d8e8] rounded-lg p-4 sm:p-6 overflow-x-auto">
          {activeMenu === 'members' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Registered members ({members.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left"><th className="p-3">S/N</th><th className="p-3">Username</th><th className="p-3">Email</th><th className="p-3">Account ID</th><th className="p-3">Wallet</th><th className="p-3">Bonus</th></tr></thead>
                  <tbody>{members.map((member, index) => (<tr key={member.id} className="border-t"><td className="p-3">{index + 1}</td><td className="p-3">{member.name}</td><td className="p-3">{member.email}</td><td className="p-3 font-mono">{member.id}</td><td className="p-3">₦{member.balance.toLocaleString()}</td><td className="p-3">₦{member.bonusBalance.toLocaleString()}</td></tr>))}</tbody>
                </table>
              </div>
            </section>
          )}

          {activeMenu === 'add-bank' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Add bank account</h2>
              <form onSubmit={submitBankAccount} className="grid sm:grid-cols-2 gap-3">
                <input value={bankForm.bankName} onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))} placeholder="Bank name" className="px-4 py-3 border border-gray-300 rounded-lg" />
                <input value={bankForm.accountName} onChange={(e) => setBankForm((p) => ({ ...p, accountName: e.target.value }))} placeholder="Account name" className="px-4 py-3 border border-gray-300 rounded-lg" />
                <input value={bankForm.accountNumber} onChange={(e) => setBankForm((p) => ({ ...p, accountNumber: e.target.value }))} placeholder="Account number" className="px-4 py-3 border border-gray-300 rounded-lg" />
                <select value={bankForm.currency} onChange={(e) => setBankForm((p) => ({ ...p, currency: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg"><option value="NGN">NGN</option><option value="CFA">CFA</option><option value="USD">USD</option></select>
                <button type="submit" className="sm:col-span-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Add account</button>
              </form>
              {platformBankAccounts.map((acc) => <p key={acc.id} className="text-sm text-gray-700">{acc.bankName} - {acc.accountName} ({acc.accountNumber}) [{acc.currency}]</p>)}
            </section>
          )}

          {activeMenu === 'edit-users' && (
            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Edit users info</h2>
              <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                {members.map((member) => (<option key={member.id} value={member.id}>{member.id} ({member.name})</option>))}
              </select>
              <form onSubmit={saveMemberEdits} className="grid sm:grid-cols-2 gap-3">
                <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="px-4 py-3 border border-gray-300 rounded-lg" />
                <input value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="px-4 py-3 border border-gray-300 rounded-lg" />
                <button type="submit" className="sm:col-span-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save changes</button>
              </form>
            </section>
          )}

          {activeMenu === 'pending-deposits' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Confirm pending deposits ({pendingDeposits.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left"><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Amount</th><th className="p-3">Currency</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
                  <tbody>{deposits.length === 0 ? <tr><td colSpan={6} className="p-4 text-gray-500">No deposits yet.</td></tr> : deposits.map((d) => (<tr key={d.id} className="border-t"><td className="p-3">{new Date(d.date).toLocaleString()}</td><td className="p-3">{d.userId}</td><td className="p-3">{d.amount?.toLocaleString()}</td><td className="p-3">{d.currency}</td><td className="p-3">{d.status}</td><td className="p-3"><div className="flex gap-2">{d.status === 'pending' && <><button onClick={() => approveDeposit(d.id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Confirm</button><button onClick={() => rejectDeposit(d.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button></>}{d.status === 'approved' && <button onClick={() => reverseDeposit(d.id)} className="px-2 py-1 bg-gray-700 text-white rounded text-xs">Reverse</button>}</div></td></tr>))}</tbody>
                </table>
              </div>
            </section>
          )}

          {activeMenu === 'members-withdrawals' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Members withdrawals ({pendingWithdrawals.length} pending)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left"><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Amount</th><th className="p-3">Currency</th><th className="p-3">Account</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
                  <tbody>{withdrawals.length === 0 ? <tr><td colSpan={7} className="p-4 text-gray-500">No withdrawal requests yet.</td></tr> : withdrawals.map((w) => (<tr key={w.id} className="border-t"><td className="p-3">{new Date(w.date).toLocaleString()}</td><td className="p-3">{w.userId}</td><td className="p-3">${Number(w.amountUsd || 0).toFixed(2)}<p className="text-xs text-amber-700">Fee: ${Number(w.feeUsd || 0).toFixed(2)}</p><p className="text-xs text-green-700">Net: ${Number(w.netAmountUsd || 0).toFixed(2)}</p></td><td className="p-3">{w.currency}</td><td className="p-3 font-mono">{w.accountNumber}</td><td className="p-3">{w.status}</td><td className="p-3"><div className="flex gap-2">{w.status === 'pending' && <><button onClick={() => { const ok = approveWithdrawal(w.id); if (!ok) alert('Cannot approve: user wallet is lower than request.') }} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button><button onClick={() => rejectWithdrawal(w.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button></>}{w.status === 'approved' && <button onClick={() => reverseWithdrawal(w.id)} className="px-2 py-1 bg-gray-700 text-white rounded text-xs">Reverse</button>}</div></td></tr>))}</tbody>
                </table>
              </div>
            </section>
          )}

          {activeMenu === 'bonus-withdrawals' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Bonus withdrawals</h2>
              <form onSubmit={createBonusWithdrawal} className="grid sm:grid-cols-3 gap-3">
                <select value={bonusWithdrawalForm.memberId} onChange={(e) => setBonusWithdrawalForm((p) => ({ ...p, memberId: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg">{members.map((member) => <option key={member.id} value={member.id}>{member.id}</option>)}</select>
                <input value={bonusWithdrawalForm.amount} onChange={(e) => setBonusWithdrawalForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Amount" className="px-4 py-3 border border-gray-300 rounded-lg" />
                <input value={bonusWithdrawalForm.accountNumber} onChange={(e) => setBonusWithdrawalForm((p) => ({ ...p, accountNumber: e.target.value }))} placeholder="Account number" className="px-4 py-3 border border-gray-300 rounded-lg" />
                <button type="submit" className="sm:col-span-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Create bonus withdrawal</button>
              </form>
              <p className="text-sm text-gray-500">Pending bonus withdrawals: {pendingBonusWithdrawals.length}</p>
              <div className="space-y-2">
                {bonusWithdrawals.slice(0, 8).map((w) => (
                  <div key={w.id} className="border border-gray-200 rounded-lg p-3 text-sm flex items-center justify-between">
                    <span>{w.userId} · ₦{w.amount.toLocaleString()} · {w.accountNumber} · {w.status}</span>
                    {w.status === 'pending' && <button onClick={() => approveBonusWithdrawal(w.id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeMenu === 'gift-code' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Generate Gift Code</h2>
              <form onSubmit={generateGiftCode} className="grid gap-3">
                <input value={giftForm.value} onChange={(e) => setGiftForm((p) => ({ ...p, value: e.target.value }))} placeholder="Gift value (NGN)" className="px-4 py-3 border border-gray-300 rounded-lg" />
                <input value={giftForm.note} onChange={(e) => setGiftForm((p) => ({ ...p, note: e.target.value }))} placeholder="Note (optional)" className="px-4 py-3 border border-gray-300 rounded-lg" />
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Generate</button>
              </form>
              {giftCodes.map((gift) => (<div key={gift.id} className="p-3 border border-gray-200 rounded-lg text-sm"><p><span className="font-semibold">{gift.code}</span> - ₦{gift.value.toLocaleString()}</p><p className="text-gray-500">{gift.note || 'No note'} · {new Date(gift.createdAt).toLocaleString()}</p></div>))}
            </section>
          )}

          {activeMenu === 'account-topup' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Account Top up</h2>
              <div className="grid sm:grid-cols-3 gap-2">
                <select value={topupForm.memberId} onChange={(e) => setTopupForm((p) => ({ ...p, memberId: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg">{members.map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}</select>
                <input value={topupForm.amount} onChange={(e) => setTopupForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Top up amount" className="px-3 py-2 border border-gray-300 rounded-lg" />
                <button onClick={() => applyWalletChange(topupForm, 'add', 'topup')} className="px-3 py-2 bg-primary-600 text-white rounded-lg">Top up</button>
              </div>
            </section>
          )}

          {activeMenu === 'deduct-account' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Deduct Account</h2>
              <div className="grid sm:grid-cols-3 gap-2">
                <select value={deductForm.memberId} onChange={(e) => setDeductForm((p) => ({ ...p, memberId: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg">{members.map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}</select>
                <input value={deductForm.amount} onChange={(e) => setDeductForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Deduct amount" className="px-3 py-2 border border-gray-300 rounded-lg" />
                <button onClick={() => applyWalletChange(deductForm, 'deduct', 'deduct')} className="px-3 py-2 bg-red-600 text-white rounded-lg">Deduct</button>
              </div>
            </section>
          )}

          {activeMenu === 'lock-withdrawal' && (
            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              <h2 className="text-lg font-semibold">Lock/Unlock Withdrawal</h2>
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                  <span>{member.id}</span>
                  <button onClick={() => updateMember(member.id, (m) => ({ ...m, withdrawalLocked: !m.withdrawalLocked }))} className={`px-3 py-1 rounded text-white text-sm ${member.withdrawalLocked ? 'bg-green-600' : 'bg-amber-600'}`}>{member.withdrawalLocked ? 'Unlock' : 'Lock'}</button>
                </div>
              ))}
            </section>
          )}

          {activeMenu === 'purchased-history' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Purchased engine history</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left"><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Package</th><th className="p-3">Deposit</th></tr></thead>
                  <tbody>{purchasedHistory.length === 0 ? <tr><td colSpan={4} className="p-4 text-gray-500">No purchased engine history yet.</td></tr> : purchasedHistory.map((d) => (<tr key={d.id} className="border-t"><td className="p-3">{new Date(d.approvedAt || d.date).toLocaleString()}</td><td className="p-3">{d.userId}</td><td className="p-3">${d.pack}</td><td className="p-3">{d.currency} {d.amount?.toLocaleString()}</td></tr>))}</tbody>
                </table>
              </div>
            </section>
          )}

          {activeMenu === 'register-admin' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Register Admin</h2>
              <form onSubmit={registerAdmin} className="grid gap-3">
                <input value={registerAdminForm.email} onChange={(e) => setRegisterAdminForm((p) => ({ ...p, email: e.target.value }))} placeholder="Admin email" className="px-4 py-3 border border-gray-300 rounded-lg" />
                <input value={registerAdminForm.password} onChange={(e) => setRegisterAdminForm((p) => ({ ...p, password: e.target.value }))} placeholder="Password" className="px-4 py-3 border border-gray-300 rounded-lg" />
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Register</button>
              </form>
              <ul className="text-sm text-gray-700 space-y-1">{adminAccounts.map((admin) => <li key={admin.email}>{admin.email}</li>)}</ul>
            </section>
          )}

          {activeMenu === 'change-password' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
              <form onSubmit={changePassword} className="grid gap-3">
                <input type="password" value={changePasswordForm.oldPassword} onChange={(e) => setChangePasswordForm((p) => ({ ...p, oldPassword: e.target.value }))} placeholder="Old password" className="px-4 py-3 border border-gray-300 rounded-lg" />
                <input type="password" value={changePasswordForm.newPassword} onChange={(e) => setChangePasswordForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="New password" className="px-4 py-3 border border-gray-300 rounded-lg" />
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Update</button>
              </form>
            </section>
          )}

          {activeMenu === 'announcement' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Make Announcement</h2>
              <form onSubmit={postAnnouncement} className="flex flex-col gap-3">
                <textarea value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} rows={3} placeholder="Announcement message..." className="px-4 py-3 border border-gray-300 rounded-lg" />
                <button type="submit" className="self-start px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Post announcement</button>
              </form>
              {announcements.map((item) => (<div key={item.id} className="p-3 border border-gray-200 rounded-lg text-sm"><p>{item.text}</p><p className="text-gray-500 mt-1">{new Date(item.date).toLocaleString()}</p></div>))}
            </section>
          )}

          {activeMenu === 'investment-history' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Investment History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left"><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Type</th><th className="p-3">Amount</th></tr></thead>
                  <tbody>{investmentHistory.length === 0 ? <tr><td colSpan={4} className="p-4 text-gray-500">No history yet.</td></tr> : investmentHistory.map((h) => (<tr key={h.id} className="border-t"><td className="p-3">{new Date(h.date).toLocaleString()}</td><td className="p-3">{h.memberId}</td><td className="p-3">{h.type}</td><td className="p-3">₦{h.amount.toLocaleString()}</td></tr>))}</tbody>
                </table>
              </div>
            </section>
          )}

          {activeMenu === 'deposit-history' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Deposit History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left"><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Amount</th><th className="p-3">Currency</th><th className="p-3">Country</th><th className="p-3">Pack</th><th className="p-3">Status</th></tr></thead>
                  <tbody>{deposits.length === 0 ? <tr><td colSpan={7} className="p-4 text-gray-500">No deposits yet.</td></tr> : deposits.map((d) => (<tr key={d.id} className="border-t"><td className="p-3">{new Date(d.date).toLocaleString()}</td><td className="p-3">{d.userId}</td><td className="p-3">{d.amount?.toLocaleString()}</td><td className="p-3">{d.currency}</td><td className="p-3">{d.country}</td><td className="p-3">${d.pack?.toLocaleString()}</td><td className="p-3">{d.status}</td></tr>))}</tbody>
                </table>
              </div>
            </section>
          )}

          {activeMenu === 'withdrawal-history' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Withdrawal History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left"><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Amount</th><th className="p-3">Currency</th><th className="p-3">Account</th><th className="p-3">Status</th></tr></thead>
                  <tbody>{withdrawals.length === 0 ? <tr><td colSpan={6} className="p-4 text-gray-500">No withdrawal requests yet.</td></tr> : withdrawals.map((w) => (<tr key={w.id} className="border-t"><td className="p-3">{new Date(w.date).toLocaleString()}</td><td className="p-3">{w.userId}</td><td className="p-3">${Number(w.amountUsd || 0).toFixed(2)}<p className="text-xs text-amber-700">Fee: ${Number(w.feeUsd || 0).toFixed(2)}</p><p className="text-xs text-green-700">Net: ${Number(w.netAmountUsd || 0).toFixed(2)}</p></td><td className="p-3">{w.currency}</td><td className="p-3 font-mono">{w.accountNumber}</td><td className="p-3">{w.status}</td></tr>))}</tbody>
                </table>
              </div>
            </section>
          )}

          {activeMenu === 'bonus-history' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Bonus Withdrawal History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left"><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Amount</th><th className="p-3">Account</th><th className="p-3">Status</th></tr></thead>
                  <tbody>{bonusWithdrawals.length === 0 ? <tr><td colSpan={5} className="p-4 text-gray-500">No bonus withdrawal history yet.</td></tr> : bonusWithdrawals.map((w) => (<tr key={w.id} className="border-t"><td className="p-3">{new Date(w.date).toLocaleString()}</td><td className="p-3">{w.userId}</td><td className="p-3">₦{w.amount.toLocaleString()}</td><td className="p-3 font-mono">{w.accountNumber}</td><td className="p-3">{w.status}</td></tr>))}</tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default Admin

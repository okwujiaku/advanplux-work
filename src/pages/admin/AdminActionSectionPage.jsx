import { useEffect, useMemo, useState } from 'react'
import { useLocation, useOutletContext, useParams } from 'react-router-dom'
import { getMemberDisplay } from './memberDisplay'

function AdminActionSectionPage() {
  const { section: sectionParam } = useParams()
  const location = useLocation()
  const section = sectionParam || location.pathname.split('/').filter(Boolean).pop()
  const {
    members,
    selectedMember,
    selectedMemberId,
    setSelectedMemberId,
    updateMember,
    platformBankAccounts,
    giftCodes,
    adVideoIds,
    setAdVideoIds,
    announcements,
    adminAccounts,
    submitBankAccount,
    deleteBankAccount,
    saveMemberEdits,
    applyWalletChange,
    generateGiftCode,
    registerAdmin,
    changePassword,
    postAnnouncement,
  } = useOutletContext()

  const [bankForm, setBankForm] = useState({ bankName: '', accountName: '', accountNumber: '', currency: 'USD' })
  const [editForm, setEditForm] = useState({ email: '', accountNumber: '' })
  const [editUserSearch, setEditUserSearch] = useState('')
  const editableMembers = useMemo(
    () => members.filter((m) => m.id !== 'current-user'),
    [members],
  )
  const editUserFiltered = useMemo(() => {
    const q = editUserSearch.trim().toLowerCase()
    if (!q) return editableMembers
    return editableMembers.filter((m) => {
      const joined = m.joinedAt ? new Date(m.joinedAt).toLocaleString() : ''
      const s = [m.id, m.name, m.email, m.phone, m.invitationCode, m.referredByUserId, joined]
        .map((v) => String(v || '').toLowerCase())
        .join(' ')
      return s.includes(q)
    })
  }, [editableMembers, editUserSearch])
  const [topupForm, setTopupForm] = useState({ email: '', amount: '' })
  const [deductForm, setDeductForm] = useState({ memberId: selectedMemberId, amount: '' })
  const [giftForm, setGiftForm] = useState({ value: '' })
  const [globalWithdrawalLocked, setGlobalWithdrawalLocked] = useState(null)
  const [withdrawalLockLoading, setWithdrawalLockLoading] = useState(false)
  const [videoUrlsText, setVideoUrlsText] = useState(() => (Array.isArray(adVideoIds) ? adVideoIds.join('\n') : ''))
  const [announcementText, setAnnouncementText] = useState('')
  const [registerAdminForm, setRegisterAdminForm] = useState({ email: '', password: '' })
  const [changePasswordForm, setChangePasswordForm] = useState({ oldPassword: '', newPassword: '' })

  useEffect(() => {
    if (selectedMember && selectedMember.id !== 'current-user') {
      setEditForm({
        email: selectedMember.email || '',
        accountNumber: selectedMember.invitationCode || '',
      })
    }
  }, [selectedMember])

  useEffect(() => {
    setVideoUrlsText(Array.isArray(adVideoIds) ? adVideoIds.join('\n') : '')
  }, [adVideoIds])

  useEffect(() => {
    if (section !== 'lock-withdrawal') return
    const key = (typeof window !== 'undefined' && window.sessionStorage?.getItem('adminApiKey')) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_SECRET) || ''
    fetch('/api/admin/withdrawal-lock', { headers: key ? { 'X-Admin-Key': key } : {} })
      .then((r) => r.json())
      .then((d) => { if (d?.ok) setGlobalWithdrawalLocked(!!d.locked) })
      .catch(() => setGlobalWithdrawalLocked(false))
  }, [section])

  if (section === 'add-bank') {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Add Bank Account</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={bankForm.bankName} onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))} placeholder="Bank name" className="px-4 py-3 border border-gray-300 rounded-lg" />
          <input value={bankForm.accountName} onChange={(e) => setBankForm((p) => ({ ...p, accountName: e.target.value }))} placeholder="Account name" className="px-4 py-3 border border-gray-300 rounded-lg" />
          <input value={bankForm.accountNumber} onChange={(e) => setBankForm((p) => ({ ...p, accountNumber: e.target.value }))} placeholder="Account number" className="px-4 py-3 border border-gray-300 rounded-lg" />
          <select value={bankForm.currency} onChange={(e) => setBankForm((p) => ({ ...p, currency: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg"><option value="NGN">NGN</option><option value="CFA">CFA</option><option value="USD">USD</option></select>
        </div>
        <button onClick={() => { submitBankAccount(bankForm); setBankForm({ bankName: '', accountName: '', accountNumber: '', currency: 'USD' }) }} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">Add account</button>
        <div className="space-y-2 mt-3">
          {platformBankAccounts.map((acc) => (
            <div key={acc.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-2 text-sm text-gray-700">
              <p>{acc.bankName} - {acc.accountName} ({acc.accountNumber}) [{acc.currency}]</p>
              <button
                onClick={() => deleteBankAccount(acc.id)}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (section === 'edit-users') {
    const showSearchResults = editUserSearch.trim().length > 0

    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Edit Users Info.</h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">Search member</label>
        <input
          type="text"
          value={editUserSearch}
          onChange={(e) => setEditUserSearch(e.target.value)}
          placeholder="Search by name, email, phone, invitation code, account ID..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2"
        />
        {showSearchResults && (
          <ul className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto mb-4">
            {editUserFiltered.length === 0 ? (
              <li className="p-3 text-gray-500 text-sm">No members match.</li>
            ) : (
              editUserFiltered.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMemberId(m.id)
                      setEditForm({ email: m.email || '', accountNumber: m.invitationCode || '' })
                      setEditUserSearch('')
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0 ${selectedMemberId === m.id ? 'bg-primary-50 text-primary-800' : ''}`}
                  >
                    {getMemberDisplay(m)}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}

        {selectedMember && (
          <>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Member details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><dt className="text-gray-500">Email / Name</dt><dd>{getMemberDisplay(selectedMember)}</dd></div>
                <div><dt className="text-gray-500">Joined</dt><dd>{selectedMember.joinedAt ? new Date(selectedMember.joinedAt).toLocaleString() : '–'}</dd></div>
                <div><dt className="text-gray-500">Phone</dt><dd>{selectedMember.phone || '–'}</dd></div>
                <div><dt className="text-gray-500">Invitation code</dt><dd className="font-mono">{selectedMember.invitationCode || '–'}</dd></div>
                <div><dt className="text-gray-500">Referred by</dt><dd className="truncate font-mono">{selectedMember.referredByUserId ? (members.find((m) => m.id === selectedMember.referredByUserId))?.invitationCode ?? '–' : '–'}</dd></div>
                <div><dt className="text-gray-500">Wallet balance</dt><dd>${Number(selectedMember.balance ?? 0).toLocaleString()}</dd></div>
                <div><dt className="text-gray-500">Bonus balance</dt><dd>${Number(selectedMember.bonusBalance ?? 0).toLocaleString()}</dd></div>
                <div><dt className="text-gray-500">Withdrawal</dt><dd>{selectedMember.withdrawalLocked ? 'Locked' : 'Unlocked'}</dd></div>
              </dl>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mb-2">Editable fields (email and account number only)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email"
                className="px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                value={editForm.accountNumber}
                onChange={(e) => setEditForm((p) => ({ ...p, accountNumber: e.target.value }))}
                placeholder="Account number (Invitation code)"
                className="px-4 py-3 border border-gray-300 rounded-lg font-mono"
              />
            </div>
            <button onClick={() => saveMemberEdits(selectedMemberId, editForm)} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">Save changes</button>
          </>
        )}
      </section>
    )
  }

  if (section === 'gift-code') {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Generate Gift Code</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={giftForm.value} onChange={(e) => setGiftForm((p) => ({ ...p, value: e.target.value }))} placeholder="Gift value (Dollar)" className="px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
        <button onClick={() => { generateGiftCode(giftForm); setGiftForm({ value: '' }) }} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">Generate</button>
        {giftCodes.map((gift) => (<div key={gift.id} className="p-3 border border-gray-200 rounded-lg text-sm mt-2"><p><span className="font-semibold">{gift.code}</span> - ${Number(gift.value).toLocaleString()}</p></div>))}
      </section>
    )
  }

  if (section === 'video-manager') {
    const getAdminKey = () =>
      (typeof window !== 'undefined' && window.sessionStorage?.getItem('adminApiKey')) ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_SECRET) ||
      ''
    const saveVideoUrls = async () => {
      const parsedUrls = videoUrlsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      const validUrls = parsedUrls.filter((line) => /^https?:\/\//i.test(line))
      const youtubeUrls = validUrls.filter((line) => {
        const lowered = line.toLowerCase()
        return lowered.includes('youtube.com') || lowered.includes('youtu.be')
      })
      if (youtubeUrls.length === 0) {
        alert('Please add at least one valid YouTube link.')
        return
      }
      if (youtubeUrls.length !== validUrls.length) {
        alert('Only YouTube links are allowed. Non-YouTube links were ignored.')
      }
      const key = getAdminKey()
      try {
        const res = await fetch('/api/admin/ad-videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Admin-Key': key } : {}) },
          body: JSON.stringify({ urls: youtubeUrls }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok && data?.ok) {
          setAdVideoIds(youtubeUrls)
          alert('YouTube links saved. All devices will see the updated list.')
          return
        }
      } catch {
        // fall through to local only
      }
      setAdVideoIds(youtubeUrls)
      alert('YouTube links saved locally. Set VITE_ADMIN_SECRET and redeploy so all devices stay in sync.')
    }

    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-2">Video Manager</h2>
        <p className="text-sm text-gray-600 mb-3">
          Paste one YouTube link per line. Only YouTube links are supported.
        </p>
        <textarea
          value={videoUrlsText}
          onChange={(e) => setVideoUrlsText(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder={'https://www.youtube.com/watch?v=example\nhttps://youtu.be/example'}
        />
        <div className="mt-3 flex items-center gap-2">
          <button onClick={saveVideoUrls} className="px-4 py-2 bg-primary-600 text-white rounded-lg">
            Save YouTube links
          </button>
          <span className="text-sm text-gray-500">Current links: {Array.isArray(adVideoIds) ? adVideoIds.length : 0}</span>
        </div>
      </section>
    )
  }

  if (section === 'account-topup') {
    const handleTopup = () => {
      const email = (topupForm.email || '').trim().toLowerCase()
      const amount = Number(topupForm.amount)
      if (!email || !amount || amount <= 0) {
        alert('Enter a valid email and amount.')
        return
      }
      const member = editableMembers.find((m) => (m.email || '').toLowerCase() === email)
      if (!member) {
        alert('No member found with that email.')
        return
      }
      applyWalletChange({ memberId: member.id, amount: String(amount) }, 'add', 'topup')
      setTopupForm((p) => ({ ...p, amount: '' }))
    }
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Account Top up</h2>
        <p className="text-sm text-gray-600 mb-3">Enter the member&apos;s email and amount to credit their wallet.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            type="email"
            value={topupForm.email || ''}
            onChange={(e) => setTopupForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="Member email"
            className="px-4 py-3 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={topupForm.amount}
            onChange={(e) => setTopupForm((p) => ({ ...p, amount: e.target.value }))}
            placeholder="Top up amount (USD)"
            className="px-4 py-3 border border-gray-300 rounded-lg"
          />
          <button onClick={handleTopup} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Top up</button>
        </div>
      </section>
    )
  }

  if (section === 'deduct-account') {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Deduct Account</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <select
            value={deductForm.memberId}
            onChange={(e) => setDeductForm((p) => ({ ...p, memberId: e.target.value }))}
            className="px-4 py-3 border border-gray-300 rounded-lg"
          >
            {editableMembers.map((m) => {
              const label = getMemberDisplay(m)
              return (
                <option key={m.id} value={m.id}>
                  {label}
                </option>
              )
            })}
          </select>
          <input value={deductForm.amount} onChange={(e) => setDeductForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Deduct amount" className="px-4 py-3 border border-gray-300 rounded-lg" />
          <button onClick={() => applyWalletChange(deductForm, 'deduct', 'deduct')} className="px-4 py-2 bg-red-600 text-white rounded-lg">Deduct</button>
        </div>
      </section>
    )
  }

  if (section === 'lock-withdrawal') {
    const setLock = async (lock) => {
      setWithdrawalLockLoading(true)
      const key = (typeof window !== 'undefined' && window.sessionStorage?.getItem('adminApiKey')) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_SECRET) || ''
      try {
        const res = await fetch('/api/admin/withdrawal-lock', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Admin-Key': key } : {}) },
          body: JSON.stringify({ lock }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok && data?.ok) setGlobalWithdrawalLocked(!!data.locked)
      } finally {
        setWithdrawalLockLoading(false)
      }
    }
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Lock/Unlock Withdrawal</h2>
        <p className="text-sm text-gray-600 mb-4">One setting applies to all members. When locked, no one can request a withdrawal.</p>
        <p className="text-sm font-medium text-gray-700 mb-2">Status: {globalWithdrawalLocked === null ? '…' : globalWithdrawalLocked ? 'Locked for everyone' : 'Unlocked'}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setLock(true)}
            disabled={withdrawalLockLoading || globalWithdrawalLocked === true}
            className="px-4 py-2 rounded bg-amber-600 text-white disabled:opacity-50"
          >
            Lock withdrawal for all
          </button>
          <button
            onClick={() => setLock(false)}
            disabled={withdrawalLockLoading || globalWithdrawalLocked === false}
            className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
          >
            Unlock withdrawal for all
          </button>
        </div>
      </section>
    )
  }

  if (section === 'register-admin') {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Register Admin</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={registerAdminForm.email} onChange={(e) => setRegisterAdminForm((p) => ({ ...p, email: e.target.value }))} placeholder="Admin email" className="px-4 py-3 border border-gray-300 rounded-lg" />
          <input value={registerAdminForm.password} onChange={(e) => setRegisterAdminForm((p) => ({ ...p, password: e.target.value }))} placeholder="Password" className="px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
        <button onClick={() => { registerAdmin(registerAdminForm); setRegisterAdminForm({ email: '', password: '' }) }} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">Register</button>
        <ul className="text-sm text-gray-700 mt-3">{adminAccounts.map((admin) => <li key={admin.email}>{admin.email}</li>)}</ul>
      </section>
    )
  }

  if (section === 'change-password') {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Change Password</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <input type="password" value={changePasswordForm.oldPassword} onChange={(e) => setChangePasswordForm((p) => ({ ...p, oldPassword: e.target.value }))} placeholder="Old password" className="px-4 py-3 border border-gray-300 rounded-lg" />
          <input type="password" value={changePasswordForm.newPassword} onChange={(e) => setChangePasswordForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="New password" className="px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
        <button onClick={async () => { const ok = await changePassword(changePasswordForm); if (!ok) alert('Password change failed'); setChangePasswordForm({ oldPassword: '', newPassword: '' }) }} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">Update</button>
      </section>
    )
  }

  if (section === 'announcement') {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Make Announcement</h2>
        <textarea value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Announcement message..." />
        <button onClick={() => { postAnnouncement(announcementText); setAnnouncementText('') }} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">Post</button>
        {announcements.map((item) => (<div key={item.id} className="p-3 border border-gray-200 rounded-lg text-sm mt-2"><p>{item.text}</p></div>))}
      </section>
    )
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-gray-600">Section not found.</p>
    </section>
  )
}

export default AdminActionSectionPage

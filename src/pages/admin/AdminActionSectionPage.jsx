import { useEffect, useMemo, useState } from 'react'
import { useLocation, useOutletContext, useParams } from 'react-router-dom'

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
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [editUserSearch, setEditUserSearch] = useState('')
  const editUserFiltered = useMemo(() => {
    const q = editUserSearch.trim().toLowerCase()
    if (!q) return members
    return members.filter((m) => {
      const joined = m.joinedAt ? new Date(m.joinedAt).toLocaleString() : ''
      const s = [m.id, m.name, m.email, m.phone, m.invitationCode, m.referredByUserId, joined]
        .map((v) => String(v || '').toLowerCase())
        .join(' ')
      return s.includes(q)
    })
  }, [members, editUserSearch])
  const [topupForm, setTopupForm] = useState({ memberId: selectedMemberId, amount: '' })
  const [deductForm, setDeductForm] = useState({ memberId: selectedMemberId, amount: '' })
  const [giftForm, setGiftForm] = useState({ value: '', note: '' })
  const [videoUrlsText, setVideoUrlsText] = useState(() => (Array.isArray(adVideoIds) ? adVideoIds.join('\n') : ''))
  const [announcementText, setAnnouncementText] = useState('')
  const [registerAdminForm, setRegisterAdminForm] = useState({ email: '', password: '' })
  const [changePasswordForm, setChangePasswordForm] = useState({ oldPassword: '', newPassword: '' })

  useEffect(() => {
    if (selectedMember) setEditForm({ name: selectedMember.name, email: selectedMember.email })
  }, [selectedMember])

  useEffect(() => {
    setVideoUrlsText(Array.isArray(adVideoIds) ? adVideoIds.join('\n') : '')
  }, [adVideoIds])

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
                      setEditForm({ name: m.name || '', email: m.email || '' })
                      setEditUserSearch('')
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0 ${selectedMemberId === m.id ? 'bg-primary-50 text-primary-800' : ''}`}
                  >
                    {m.name || m.email || m.id} — {m.email || m.id}
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
                <div><dt className="text-gray-500">Account ID</dt><dd className="font-mono">{selectedMember.id}</dd></div>
                <div><dt className="text-gray-500">Joined</dt><dd>{selectedMember.joinedAt ? new Date(selectedMember.joinedAt).toLocaleString() : '–'}</dd></div>
                <div><dt className="text-gray-500">Phone</dt><dd>{selectedMember.phone || '–'}</dd></div>
                <div><dt className="text-gray-500">Invitation code</dt><dd className="font-mono">{selectedMember.invitationCode || '–'}</dd></div>
                <div><dt className="text-gray-500">Referred by (user ID)</dt><dd className="font-mono truncate">{selectedMember.referredByUserId || '–'}</dd></div>
                <div><dt className="text-gray-500">Wallet balance</dt><dd>${Number(selectedMember.balance ?? 0).toLocaleString()}</dd></div>
                <div><dt className="text-gray-500">Bonus balance</dt><dd>${Number(selectedMember.bonusBalance ?? 0).toLocaleString()}</dd></div>
                <div><dt className="text-gray-500">Withdrawal</dt><dd>{selectedMember.withdrawalLocked ? 'Locked' : 'Unlocked'}</dd></div>
              </dl>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mb-2">Editable fields</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="px-4 py-3 border border-gray-300 rounded-lg" />
              <input value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="px-4 py-3 border border-gray-300 rounded-lg" />
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
          <input value={giftForm.value} onChange={(e) => setGiftForm((p) => ({ ...p, value: e.target.value }))} placeholder="Gift value (NGN)" className="px-4 py-3 border border-gray-300 rounded-lg" />
          <input value={giftForm.note} onChange={(e) => setGiftForm((p) => ({ ...p, note: e.target.value }))} placeholder="Note (optional)" className="px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
        <button onClick={() => { generateGiftCode(giftForm); setGiftForm({ value: '', note: '' }) }} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">Generate</button>
        {giftCodes.map((gift) => (<div key={gift.id} className="p-3 border border-gray-200 rounded-lg text-sm mt-2"><p><span className="font-semibold">{gift.code}</span> - ₦{gift.value.toLocaleString()}</p></div>))}
      </section>
    )
  }

  if (section === 'video-manager') {
    const saveVideoUrls = () => {
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
      setAdVideoIds(youtubeUrls)
      alert('YouTube links saved successfully.')
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
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Account Top up</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <select value={topupForm.memberId} onChange={(e) => setTopupForm((p) => ({ ...p, memberId: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg">{members.map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}</select>
          <input value={topupForm.amount} onChange={(e) => setTopupForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Top up amount" className="px-4 py-3 border border-gray-300 rounded-lg" />
          <button onClick={() => applyWalletChange(topupForm, 'add', 'topup')} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Top up</button>
        </div>
      </section>
    )
  }

  if (section === 'deduct-account') {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Deduct Account</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <select value={deductForm.memberId} onChange={(e) => setDeductForm((p) => ({ ...p, memberId: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg">{members.map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}</select>
          <input value={deductForm.amount} onChange={(e) => setDeductForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Deduct amount" className="px-4 py-3 border border-gray-300 rounded-lg" />
          <button onClick={() => applyWalletChange(deductForm, 'deduct', 'deduct')} className="px-4 py-2 bg-red-600 text-white rounded-lg">Deduct</button>
        </div>
      </section>
    )
  }

  if (section === 'lock-withdrawal') {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-2">
        <h2 className="text-lg font-semibold mb-3">Lock/Unlock Withdrawal</h2>
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
            <span>{member.id}</span>
            <button onClick={() => updateMember(member.id, (m) => ({ ...m, withdrawalLocked: !m.withdrawalLocked }))} className={`px-3 py-1 rounded text-white ${member.withdrawalLocked ? 'bg-green-600' : 'bg-amber-600'}`}>{member.withdrawalLocked ? 'Unlock' : 'Lock'}</button>
          </div>
        ))}
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
        <button onClick={() => { const ok = changePassword(changePasswordForm); if (!ok) alert('Password change failed'); setChangePasswordForm({ oldPassword: '', newPassword: '' }) }} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">Update</button>
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

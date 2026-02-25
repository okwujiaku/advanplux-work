import { useEffect, useState } from 'react'
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
    videoImportJobs,
    createVideoImportJob,
    markVideoImportReady,
    markVideoImportFailed,
    announcements,
    adminAccounts,
    submitBankAccount,
    saveMemberEdits,
    applyWalletChange,
    generateGiftCode,
    registerAdmin,
    changePassword,
    postAnnouncement,
  } = useOutletContext()

  const [bankForm, setBankForm] = useState({ bankName: '', accountName: '', accountNumber: '', currency: 'USD' })
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [topupForm, setTopupForm] = useState({ memberId: selectedMemberId, amount: '' })
  const [deductForm, setDeductForm] = useState({ memberId: selectedMemberId, amount: '' })
  const [giftForm, setGiftForm] = useState({ value: '', note: '' })
  const [importForm, setImportForm] = useState({ sourceUrl: '', note: '' })
  const [videoUrlsText, setVideoUrlsText] = useState(() => (Array.isArray(adVideoIds) ? adVideoIds.join('\n') : ''))
  const [hostedUrlInputs, setHostedUrlInputs] = useState({})
  const [failureReasonInputs, setFailureReasonInputs] = useState({})
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
        {platformBankAccounts.map((acc) => <p key={acc.id} className="text-sm text-gray-700 mt-2">{acc.bankName} - {acc.accountName} ({acc.accountNumber}) [{acc.currency}]</p>)}
      </section>
    )
  }

  if (section === 'edit-users') {
    return (
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Edit Users Info.</h2>
        <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3">
          {members.map((member) => <option key={member.id} value={member.id}>{member.id} ({member.name})</option>)}
        </select>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="px-4 py-3 border border-gray-300 rounded-lg" />
          <input value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
        <button onClick={() => saveMemberEdits(selectedMemberId, editForm)} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">Save changes</button>
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
    const createImportRequest = () => {
      const result = createVideoImportJob(importForm)
      if (!result.ok) {
        alert(result.error || 'Unable to create import request.')
        return
      }
      setImportForm({ sourceUrl: '', note: '' })
      alert('Import request created. Add hosted URL when ready.')
    }

    const saveVideoUrls = () => {
      const parsedUrls = videoUrlsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      const validUrls = parsedUrls.filter((line) => /^https?:\/\//i.test(line))
      if (validUrls.length === 0) {
        alert('Please add at least one valid http(s) video URL.')
        return
      }
      setAdVideoIds(validUrls)
      alert('Video links saved successfully.')
    }

    const completeImport = (jobId) => {
      const hostedUrl = hostedUrlInputs[jobId] || ''
      const result = markVideoImportReady(jobId, hostedUrl)
      if (!result.ok) {
        alert(result.error || 'Unable to complete import request.')
        return
      }
      setHostedUrlInputs((prev) => ({ ...prev, [jobId]: '' }))
      alert('Import marked ready and added to Watch & Earn.')
    }

    const failImport = (jobId) => {
      const reason = failureReasonInputs[jobId] || ''
      const result = markVideoImportFailed(jobId, reason)
      if (!result.ok) {
        alert(result.error || 'Unable to mark import as failed.')
        return
      }
      setFailureReasonInputs((prev) => ({ ...prev, [jobId]: '' }))
    }

    return (
      <div className="space-y-4">
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-2">Video Manager</h2>
          <p className="text-sm text-gray-600 mb-4">
            Phase 2 flow: paste source link (YouTube/TikTok/Instagram), then add your hosted MP4/HLS URL once imported.
          </p>
          <div className="grid gap-3">
            <input
              value={importForm.sourceUrl}
              onChange={(e) => setImportForm((prev) => ({ ...prev, sourceUrl: e.target.value }))}
              placeholder="Source video URL (YouTube/TikTok/Instagram)"
              className="px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              value={importForm.note}
              onChange={(e) => setImportForm((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Note (optional)"
              className="px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>
          <button onClick={createImportRequest} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">
            Create import request
          </button>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-3">Import requests</h3>
          {videoImportJobs.length === 0 ? (
            <p className="text-sm text-gray-500">No import requests yet.</p>
          ) : (
            <div className="space-y-3">
              {videoImportJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">{job.platform} - {job.status}</p>
                    <span className="text-xs text-gray-500">{new Date(job.updatedAt || job.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-600 break-all">Source: {job.sourceUrl}</p>
                  {job.note && <p className="text-xs text-gray-500">Note: {job.note}</p>}
                  {job.status === 'ready' && job.hostedUrl && (
                    <p className="text-xs text-green-700 break-all">Hosted URL: {job.hostedUrl}</p>
                  )}
                  {job.status === 'failed' && job.error && (
                    <p className="text-xs text-red-600">Error: {job.error}</p>
                  )}

                  {job.status !== 'ready' && (
                    <div className="space-y-2 pt-1">
                      <input
                        value={hostedUrlInputs[job.id] || ''}
                        onChange={(e) => setHostedUrlInputs((prev) => ({ ...prev, [job.id]: e.target.value }))}
                        placeholder="Hosted MP4/HLS URL (https://...)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => completeImport(job.id)} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm">
                          Mark ready
                        </button>
                        <input
                          value={failureReasonInputs[job.id] || ''}
                          onChange={(e) => setFailureReasonInputs((prev) => ({ ...prev, [job.id]: e.target.value }))}
                          placeholder="Failure reason (optional)"
                          className="flex-1 min-w-[180px] px-3 py-1.5 border border-gray-300 rounded text-sm"
                        />
                        <button onClick={() => failImport(job.id)} className="px-3 py-1.5 bg-red-600 text-white rounded text-sm">
                          Mark failed
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-2">Direct links list (manual override)</h3>
          <p className="text-sm text-gray-600 mb-3">
            You can still paste direct MP4/HLS links here directly.
          </p>
          <textarea
            value={videoUrlsText}
            onChange={(e) => setVideoUrlsText(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            placeholder={'https://your-cdn.com/ad-1.mp4\nhttps://your-cdn.com/ad-2.m3u8'}
          />
          <div className="mt-3 flex items-center gap-2">
            <button onClick={saveVideoUrls} className="px-4 py-2 bg-primary-600 text-white rounded-lg">
              Save direct video links
            </button>
            <span className="text-sm text-gray-500">Current links: {Array.isArray(adVideoIds) ? adVideoIds.length : 0}</span>
          </div>
        </section>
      </div>
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

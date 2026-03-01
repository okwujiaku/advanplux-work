import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getMemberDisplay } from './memberDisplay'

function AdminToolsPage() {
  const {
    members,
    platformBankAccounts,
    giftCodes,
    announcements,
    adminAccounts,
    selectedMemberId,
    setSelectedMemberId,
    updateMember,
    submitBankAccount,
    applyWalletChange,
    generateGiftCode,
    registerAdmin,
    changePassword,
    postAnnouncement,
  } = useOutletContext()

  const [bankForm, setBankForm] = useState({ bankName: '', accountName: '', accountNumber: '', currency: 'USD' })
  const [topupForm, setTopupForm] = useState({ memberId: selectedMemberId, amount: '' })
  const [deductForm, setDeductForm] = useState({ memberId: selectedMemberId, amount: '' })
  const [giftForm, setGiftForm] = useState({ value: '' })
  const [announcementText, setAnnouncementText] = useState('')
  const [registerAdminForm, setRegisterAdminForm] = useState({ email: '', password: '' })
  const [changePasswordForm, setChangePasswordForm] = useState({ oldPassword: '', newPassword: '' })

  return (
    <div className="space-y-4">
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

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Account Top up / Deduct / Lock</h2>
        <select value={selectedMemberId} onChange={(e) => { setSelectedMemberId(e.target.value); setTopupForm((p) => ({ ...p, memberId: e.target.value })); setDeductForm((p) => ({ ...p, memberId: e.target.value })) }} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3">{members.filter((m) => m.id !== 'current-user').map((m) => <option key={m.id} value={m.id}>{getMemberDisplay(m)}</option>)}</select>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="border border-gray-200 rounded-lg p-3">
            <input value={topupForm.amount} onChange={(e) => setTopupForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Top up amount" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <button onClick={() => applyWalletChange(topupForm, 'add', 'topup')} className="mt-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm">Top up</button>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <input value={deductForm.amount} onChange={(e) => setDeductForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Deduct amount" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <button onClick={() => applyWalletChange(deductForm, 'deduct', 'deduct')} className="mt-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm">Deduct</button>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {members.filter((m) => m.id !== 'current-user').map((member) => (
            <div key={member.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3 text-sm">
              <span>{getMemberDisplay(member)}</span>
              <button onClick={() => updateMember(member.id, (m) => ({ ...m, withdrawalLocked: !m.withdrawalLocked }))} className={`px-3 py-1 rounded text-white ${member.withdrawalLocked ? 'bg-green-600' : 'bg-amber-600'}`}>{member.withdrawalLocked ? 'Unlock' : 'Lock'} Withdrawal</button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Generate Gift Code</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={giftForm.value} onChange={(e) => setGiftForm((p) => ({ ...p, value: e.target.value }))} placeholder="Gift value (Dollar)" className="px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
        <button onClick={() => { generateGiftCode(giftForm); setGiftForm({ value: '' }) }} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">Generate</button>
        {giftCodes.map((gift) => (<div key={gift.id} className="p-3 border border-gray-200 rounded-lg text-sm mt-2"><p><span className="font-semibold">{gift.code}</span> - ${Number(gift.value).toLocaleString()}</p></div>))}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Make Announcement</h2>
        <textarea value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} rows={3} placeholder="Announcement message..." className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        <button onClick={() => { postAnnouncement(announcementText); setAnnouncementText('') }} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">Post</button>
        {announcements.map((item) => (<div key={item.id} className="p-3 border border-gray-200 rounded-lg text-sm mt-2"><p>{item.text}</p></div>))}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Register Admin / Change Password</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <input value={registerAdminForm.email} onChange={(e) => setRegisterAdminForm((p) => ({ ...p, email: e.target.value }))} placeholder="Admin email" className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2" />
            <input value={registerAdminForm.password} onChange={(e) => setRegisterAdminForm((p) => ({ ...p, password: e.target.value }))} placeholder="Password" className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2" />
            <button onClick={() => { registerAdmin(registerAdminForm); setRegisterAdminForm({ email: '', password: '' }) }} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Register</button>
          </div>
          <div>
            <input type="password" value={changePasswordForm.oldPassword} onChange={(e) => setChangePasswordForm((p) => ({ ...p, oldPassword: e.target.value }))} placeholder="Old password" className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2" />
            <input type="password" value={changePasswordForm.newPassword} onChange={(e) => setChangePasswordForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="New password" className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2" />
            <button onClick={async () => { const ok = await changePassword(changePasswordForm); if (!ok) alert('Password change failed'); setChangePasswordForm({ oldPassword: '', newPassword: '' }) }} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Change</button>
          </div>
        </div>
        <ul className="text-sm text-gray-700 mt-3">{adminAccounts.map((admin) => <li key={admin.email}>{admin.email}</li>)}</ul>
      </section>
    </div>
  )
}

export default AdminToolsPage

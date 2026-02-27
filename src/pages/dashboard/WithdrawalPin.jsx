import { useState } from 'react'
import { useApp } from '../../context/AppContext'

function WithdrawalPin() {
  const { hasSecurityPin, setSecurityPinForCurrentUser, verifySecurityPinForCurrentUser } = useApp()
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [currentPin, setCurrentPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault()
    setPinError('')
    setSuccess('')
    const cleanPin = pin.replace(/\D/g, '').slice(0, 4)
    const cleanConfirm = confirmPin.replace(/\D/g, '').slice(0, 4)
    if (!/^\d{4}$/.test(cleanPin)) {
      setPinError('PIN must be exactly 4 digits.')
      return
    }
    if (cleanPin !== cleanConfirm) {
      setPinError('PIN and confirm PIN must match.')
      return
    }
    if (hasSecurityPin) {
      const cleanCurrent = currentPin.replace(/\D/g, '').slice(0, 4)
      if (!/^\d{4}$/.test(cleanCurrent)) {
        setPinError('Enter your current PIN to confirm.')
        return
      }
      const ok = await verifySecurityPinForCurrentUser(cleanCurrent)
      if (!ok) {
        setPinError('Current PIN is incorrect.')
        return
      }
    }
    const ok = await setSecurityPinForCurrentUser(cleanPin)
    if (!ok) {
      setPinError('Could not save PIN. Try again.')
      return
    }
    setSuccess(hasSecurityPin ? 'Withdrawal PIN updated.' : 'Withdrawal PIN created. You’ll use it to confirm withdrawals.')
    setPin('')
    setConfirmPin('')
    setCurrentPin('')
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Withdrawal PIN</h1>
        <p className="text-gray-600 mt-1">
          {hasSecurityPin
            ? 'Change your 4-digit PIN used to confirm withdrawals.'
            : 'Create a 4-digit PIN. You’ll use it to confirm withdrawal requests.'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleCreateOrUpdate} className="space-y-4">
          {hasSecurityPin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current PIN</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="\d*"
                maxLength={4}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="••••"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {hasSecurityPin ? 'New PIN (4 digits)' : 'Create PIN (4 digits)'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d*"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d*"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="••••"
            />
          </div>
          {pinError && <p className="text-sm text-red-600">{pinError}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <p className="text-xs text-gray-500">Keep this PIN safe. You’ll need it to confirm withdrawals.</p>
          <button
            type="submit"
            disabled={
              !/^\d{4}$/.test(pin.replace(/\D/g, '')) ||
              pin.replace(/\D/g, '') !== confirmPin.replace(/\D/g, '') ||
              (hasSecurityPin && !/^\d{4}$/.test(currentPin.replace(/\D/g, '')))
            }
            className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasSecurityPin ? 'Update withdrawal PIN' : 'Create withdrawal PIN'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default WithdrawalPin

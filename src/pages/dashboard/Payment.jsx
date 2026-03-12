import { useState } from 'react'

const CURRENCIES = [
  {
    name: 'Naira (NGN)',
    code: 'NGN',
    accountName: 'Account name will be dropped here',
    accountNumber: 'Account number will be dropped here',
    bank: 'Bank name will be dropped here',
  },
  {
    name: 'CFA',
    code: 'XOF/XAF',
    accountName: 'Account name will be dropped here',
    accountNumber: 'Account number will be dropped here',
    bank: 'Bank / Mobile money will be dropped here',
  },
  {
    name: 'RWF (Rwanda)',
    code: 'RWF',
    accountName: 'Account name will be dropped here',
    accountNumber: 'Account number will be dropped here',
    bank: 'Bank / Mobile money will be dropped here',
  },
]

function Payment() {
  const [activeCurrency, setActiveCurrency] = useState(0)
  const c = CURRENCIES[activeCurrency]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Make payment using any of the accounts below. Use the currency that suits you (Naira, CFA, or RWF).
        </p>
      </div>

      {/* Currency tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {CURRENCIES.map((cur, i) => (
          <button
            key={cur.code}
            onClick={() => setActiveCurrency(i)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeCurrency === i
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {cur.name}
          </button>
        ))}
      </div>

      {/* Account details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{c.name}</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Account name</p>
            <p className="text-gray-900 dark:text-gray-200 font-medium">{c.accountName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Account number</p>
            <p className="text-gray-900 dark:text-gray-200 font-medium font-mono">{c.accountNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bank / Payment channel</p>
            <p className="text-gray-900 dark:text-gray-200 font-medium">{c.bank}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Account numbers will be updated here. Pay the exact amount for your chosen ad pack (see Ads Engine).
        </p>
      </div>
    </div>
  )
}

export default Payment

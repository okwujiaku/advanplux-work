function SupportCenter() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#143D59] dark:text-white">Support Center</h1>
        <p className="text-[#1B4965] dark:text-gray-400 mt-1">Get help with deposits, withdrawals, account, and ads issues.</p>
      </div>

      <div className="bg-[#1B4965] dark:bg-gray-800 rounded-xl border border-[#2b607f] dark:border-gray-700 shadow-lg p-6 text-white dark:text-gray-200">
        <h2 className="text-lg font-semibold mb-3">Contact support</h2>
        <p className="text-white/90 text-sm mb-2">Contact here for immediate respond.</p>
        <p className="text-white/85 mt-4">Email: support@advanplux.com</p>
        <p className="text-white/85 mt-2">
          WhatsApp:{' '}
          <a href="https://wa.me/639979552631" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:no-underline">
            Chat on WhatsApp
          </a>
        </p>
        <p className="text-white/70 text-sm mt-3">Support replies within few minutes.</p>
      </div>
    </div>
  )
}

export default SupportCenter

function PromoteBusiness() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#143D59] dark:text-white">Promote your business with us</h1>
        <p className="text-[#1B4965] dark:text-gray-400 mt-1">
          Share your brand with our community. Follow the steps below to get started.
        </p>
      </div>

      <section className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg bg-blue-100 dark:bg-blue-900/40 ring-1 ring-blue-200 dark:ring-blue-800 flex items-center justify-center text-2xl sm:text-3xl">
            📣
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">How it works</h2>
            <p className="text-sm text-slate-700 dark:text-gray-300">
              To promote your business with us, make a 30 seconds video of your company/brand and after making the video, contact us on WhatsApp:{' '}
              <a href="https://wa.me/639979552631" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">Chat on WhatsApp</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PromoteBusiness

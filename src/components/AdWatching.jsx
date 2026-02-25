function AdWatching() {
  return (
    <section id="watch-ads" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Watch Ads & Earn
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple, straightforward earning. Watch short ads and get paid instantly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Info */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Start</h3>
                <p className="text-gray-600">Just click play and watch. No complicated setup required.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Payments</h3>
                <p className="text-gray-600">Earnings are credited to your account immediately after watching.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Limits</h3>
                <p className="text-gray-600">Watch as many ads as you want. The more you watch, the more you earn.</p>
              </div>
            </div>
          </div>

          {/* Right side - Ad Display Card */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 shadow-xl">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              {/* Ad Display Area - Image/Write-up */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mb-4 p-8 border-2 border-dashed border-primary-300">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Premium Ad Content</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Discover amazing products and services from trusted brands. 
                      Each ad showcases valuable offers and exclusive deals.
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <span>📱 Mobile Apps</span>
                      <span>•</span>
                      <span>🛍️ Shopping</span>
                      <span>•</span>
                      <span>💼 Business</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Earnings per ad:</span>
                  <span className="text-2xl font-bold text-primary-600">₦50 / CFA 300 / RWF 1,200</span>
                </div>
                
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Today's Progress</div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold">12 / 50 ads</span>
                    <span className="text-sm text-gray-500">₦600 earned</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                </div>

                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md">
                  Start Watching Ads
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdWatching

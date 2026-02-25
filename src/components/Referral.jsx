function Referral() {
  return (
    <section id="referrals" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Refer & Earn More
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your referral link and earn when your friends join and start watching ads.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Referral Link Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Referral Link</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                <input
                  type="text"
                  readOnly
                  value="https://advanplux.com/ref/ABC123XYZ"
                  className="flex-1 bg-transparent text-gray-700 text-sm focus:outline-none"
                />
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Copy
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">247</div>
                  <div className="text-sm text-gray-600">Total Referrals</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">₦617,500</div>
                  <div className="text-sm text-gray-600">Referral Earnings</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Share on Facebook
                </button>
                <button className="flex-1 bg-blue-400 hover:bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Share on Twitter
                </button>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Share Your Link</h4>
                    <p className="text-gray-600 text-sm">Copy and share your unique referral link with friends and family.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">They Sign Up</h4>
                    <p className="text-gray-600 text-sm">Your referrals sign up using your link and start watching ads.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">You Earn</h4>
                    <p className="text-gray-600 text-sm">Earn ₦2,500 / CFA 15,000 / RWF 60,000 for each referral who watches their first 10 ads.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Referral Bonus Structure</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Per Active Referral</span>
                  <span className="font-bold">₦2,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Monthly Bonus (10+ referrals)</span>
                  <span className="font-bold">₦25,000</span>
                </div>
                <div className="flex justify-between items-center border-t border-white border-opacity-30 pt-3">
                  <span className="font-semibold">Total Potential</span>
                  <span className="font-bold text-xl">Unlimited</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Referral

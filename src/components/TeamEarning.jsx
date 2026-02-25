function TeamEarning() {
  return (
    <section id="team" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Build Your Team & Earn
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            When your team reaches certain milestones, you unlock team bonuses and passive income.
          </p>
        </div>

        {/* Team Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-2">1,247</div>
            <div className="text-purple-100">Total Team Members</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-2">₦4,225,000</div>
            <div className="text-green-100">Team Earnings</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-2">Level 3</div>
            <div className="text-blue-100">Current Tier</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-2">247</div>
            <div className="text-orange-100">Active This Month</div>
          </div>
        </div>

        {/* Tier System */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Level 1 */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border-2 border-amber-300">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-amber-800">Level 1</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Required Members:</span>
                <span className="font-bold text-amber-800">10+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Monthly Bonus:</span>
                <span className="font-bold text-amber-800">₦50,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Commission Rate:</span>
                <span className="font-bold text-amber-800">10%</span>
              </div>
              <div className="pt-3 border-t border-amber-300">
                <div className="text-sm text-gray-600">Status: <span className="font-semibold text-green-600">✓ Achieved</span></div>
              </div>
            </div>
          </div>

          {/* Level 2 */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl p-6 border-2 border-gray-400">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Level 2</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Required Members:</span>
                <span className="font-bold text-gray-800">50+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Monthly Bonus:</span>
                <span className="font-bold text-gray-800">₦250,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Commission Rate:</span>
                <span className="font-bold text-gray-800">2%</span>
              </div>
              <div className="pt-3 border-t border-gray-400">
                <div className="text-sm text-gray-600">Status: <span className="font-semibold text-green-600">✓ Achieved</span></div>
              </div>
            </div>
          </div>

          {/* Level 3 */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-200 rounded-xl p-6 border-2 border-yellow-400">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-yellow-800">Level 3</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Required Members:</span>
                <span className="font-bold text-yellow-800">200+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Monthly Bonus:</span>
                <span className="font-bold text-yellow-800">₦1,000,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Commission Rate:</span>
                <span className="font-bold text-yellow-800">1%</span>
              </div>
              <div className="pt-3 border-t border-yellow-400">
                <div className="text-sm text-gray-600">Status: <span className="font-semibold text-green-600">✓ Achieved</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Progress to Platinum Tier</h3>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span>Current: 1,247 members</span>
              <span>Target: 1,000 members</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-4">
              <div className="bg-white h-4 rounded-full flex items-center justify-end pr-2" style={{ width: '100%' }}>
                <span className="text-xs font-semibold text-primary-600">100%</span>
              </div>
            </div>
          </div>
          <p className="text-primary-100">🎉 Congratulations! You've unlocked Platinum Tier benefits!</p>
        </div>
      </div>
    </section>
  )
}

export default TeamEarning

function Activities() {
  const activities = [
    {
      icon: "🎯",
      title: "Daily Challenges",
      description: "Complete daily tasks and earn bonus rewards",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "🏆",
      title: "Leaderboard",
      description: "Compete with others and climb the ranks",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: "🎁",
      title: "Rewards Store",
      description: "Redeem your earnings for gift cards and prizes",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "Track your earnings and performance metrics",
      color: "from-green-500 to-green-600"
    },
    {
      icon: "🎮",
      title: "Mini Games",
      description: "Play games and earn extra coins",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: "💬",
      title: "Community Forum",
      description: "Connect with other earners and share tips",
      color: "from-indigo-500 to-indigo-600"
    }
  ]

  return (
    <section id="activities" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            More Ways to Earn
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore additional activities and features to maximize your earnings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${activity.color} rounded-lg flex items-center justify-center text-3xl mb-4`}>
                {activity.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>
              <p className="text-gray-600 mb-4">{activity.description}</p>
              <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                Learn More →
              </button>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {/* News & Updates */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">📰 Latest News</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-primary-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-1">New Feature: Weekly Bonuses</h4>
                <p className="text-sm text-gray-600">Earn extra rewards every week by staying active!</p>
                <span className="text-xs text-gray-400">2 days ago</span>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-1">Payment System Updated</h4>
                <p className="text-sm text-gray-600">Faster withdrawals now available for all users.</p>
                <span className="text-xs text-gray-400">1 week ago</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-2xl font-bold mb-4">⚡ Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Earnings Today</span>
                <span className="text-2xl font-bold">₦12,250</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Ads Watched Today</span>
                <span className="text-2xl font-bold">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Current Streak</span>
                <span className="text-2xl font-bold">12 days 🔥</span>
              </div>
              <div className="pt-4 border-t border-white border-opacity-30">
                <button className="w-full bg-white text-primary-600 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  View Full Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Activities

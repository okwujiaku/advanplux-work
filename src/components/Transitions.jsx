import { useState, useEffect } from 'react'

function Transitions() {
  const transitions = [
    {
      message: "Proof: ****59364 completed 10 ads today and earned $4.00 from watch ads.",
      icon: "🔊"
    },
    {
      message: "Proof: ****88291 completed 5 ads and received $2.00 watch-ads earnings.",
      icon: "🔊"
    },
    {
      message: "Proof: ****42778 referred a new member and got $15.00 referral bonus.",
      icon: "🔊"
    },
    {
      message: "Proof: ****90123 hit 100 direct active downlines and unlocked $40 weekly team salary.",
      icon: "🔊"
    },
    {
      message: "Proof: ****15678 reached 200 direct active downlines and now receives $100/week team salary.",
      icon: "🔊"
    },
    {
      message: "Proof: ****34567 referred 3 users this week and earned a combined $22.00 referral reward.",
      icon: "🔊"
    },
    {
      message: "Proof: ****66721 watched ads, earned referral bonus, and withdrew payout successfully.",
      icon: "🔊"
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % transitions.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [transitions.length])

  return (
    <div className="relative border-b border-gray-200 bg-gray-50/80">
      {/* Transition message banner - aligned with nav content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 py-2.5 min-h-[52px]">
          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto justify-center">
            <span className="text-xl flex-shrink-0" style={{ color: '#22c55e' }}>{transitions[currentIndex].icon}</span>
            <p className="text-gray-900 text-sm md:text-base flex-1 text-center sm:text-left">
              {transitions[currentIndex].message}
            </p>
          </div>
          {/* Pagination dots */}
          <div className="flex space-x-1 flex-shrink-0">
            {transitions.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Transitions

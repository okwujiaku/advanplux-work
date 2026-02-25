import { Link } from 'react-router-dom'

function Hero() {
  return (
    <section id="home" className="relative bg-[linear-gradient(135deg,#143D59_0%,#1B4965_100%)] text-white pt-8 pb-16 lg:pb-24">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 animate-fade-in text-white leading-tight">
            Earn Money While You Watch Ads
          </h1>
          <p className="text-lg md:text-xl mb-6 text-white/85">
            Watch short ads, refer friends, and earn daily from one simple platform.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium">
              Watch ads → Get paid
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium">
              Refer friends → Earn more
            </span>
          </div>

          <Link
            to="/sign-up"
            className="inline-block bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-600 transition-all transform hover:scale-105 shadow-xl"
          >
            Get Started
          </Link>

          <p className="text-xs text-white/70 mt-4">No credit card. Start earning in minutes.</p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-white/10 rounded-lg p-4 border border-white/20 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold text-white">₦2B+</div>
              <div className="text-xs md:text-sm text-white/80">Paid to Users</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-white/20 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold text-white">500K+</div>
              <div className="text-xs md:text-sm text-white/80">Active Members</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-white/20 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold text-white">24/7</div>
              <div className="text-xs md:text-sm text-white/80">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

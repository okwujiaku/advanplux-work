import Navbar from '../components/Navbar'
import Transitions from '../components/Transitions'
import Hero from '../components/Hero'

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Transitions />
      <Hero />
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-semibold text-gray-900">Advanplux</p>
          <p className="text-sm text-gray-600 mt-1">The easiest way to earn money online. Watch ads, refer friends, and build your team.</p>
          <p className="text-xs text-gray-500 mt-2">© 2026 Advanplux. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage

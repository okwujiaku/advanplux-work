import { Link } from 'react-router-dom'

function AboutUs() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">About Advanplux</h1>
        <p className="text-slate-600 dark:text-gray-300">
          Welcome to Advanplux, the platform that makes earning online effortless and enjoyable. We connect advertisers with everyday users who earn cash simply by watching short, high-quality video ads in their free moments. With fast payouts, a user-friendly dashboard, and transparent rewards, Advanplux empowers people worldwide to monetize their downtime – no special skills required, just a few minutes a day.
        </p>
        <p className="text-slate-600 dark:text-gray-300">
          Advanplux redefines side hustles: earn real money just by watching ads. Our mission is straightforward – reward you for your attention while helping brands reach engaged audiences. Enjoy a clean interface, quick withdrawals, consistent opportunities, and the freedom to earn on your schedule. Discover why users call Advanplux the easiest way to make extra cash online.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">How it works</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-gray-300">
          <li>Deposit to fund your Advanplux wallet in local currency (NGN / CFA / RWF).</li>
          <li>Activate an Ads Engine package that fits your budget and daily earning goals.</li>
          <li>Watch sponsored ads every day and get rewarded in dollars.</li>
          <li>Grow your team to unlock additional bonuses and weekly rewards.</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Need help?</h2>
        <p className="text-sm text-slate-700 dark:text-gray-300">
          If you have questions about your account, deposits, withdrawals or Ads Engine packages, you can reach our
          support team from the contact section.
        </p>
        <Link
          to="/dashboard/support-center"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
        >
          Go to Contact us
        </Link>
      </div>
    </div>
  )
}

export default AboutUs


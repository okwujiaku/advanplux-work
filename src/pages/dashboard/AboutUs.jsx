import { Link } from 'react-router-dom'

function AboutUs() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">About Advanplux</h1>
        <p className="text-sm text-slate-600">
          Advanplux is a digital advertising and rewards platform where members earn in dollars by watching ads,
          building teams and activating Ads Engine packages. We focus on transparency, clear earnings, and simple
          deposit and withdrawal experiences.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
          <li>Deposit to fund your Advanplux wallet in local currency (NGN / CFA).</li>
          <li>Activate an Ads Engine package that fits your budget and daily earning goals.</li>
          <li>Watch sponsored ads every day and get rewarded in dollars.</li>
          <li>Grow your team to unlock additional bonuses and weekly rewards.</li>
        </ul>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Need help?</h2>
        <p className="text-sm text-slate-700">
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


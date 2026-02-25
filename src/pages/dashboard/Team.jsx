import { useApp } from '../../context/AppContext'

const SALARY_TIERS = [
  { investors: 25, salary: 6, label: '25 direct active downlines' },
  { investors: 50, salary: 15, label: '50 direct active downlines' },
  { investors: 100, salary: 40, label: '100 direct active downlines' },
  { investors: 200, salary: 100, label: '200 direct active downlines' },
  { investors: 500, salary: 300, label: '500 direct active downlines' },
  { investors: 1000, salary: 700, label: '1000 direct active downlines' },
]

function Team() {
  const { teamCount, referralCount, claimSalary, claimedSalary } = useApp()
  const referralTotal = (referralCount.level1 || 0) + (referralCount.level2 || 0) + (referralCount.level3 || 0)
  const investorCount = Math.max(teamCount, referralTotal)
  const currentTier = SALARY_TIERS.filter((t) => investorCount >= t.investors).pop()
  const nextTier = SALARY_TIERS.find((t) => t.investors > investorCount)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="text-gray-600 mt-1">
          Number of direct active downlines under you. Earn weekly salary as your downline count increases.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Direct active downlines</p>
          <p className="text-3xl font-bold text-gray-900">{investorCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Next tier target</p>
          <p className="text-3xl font-bold text-primary-600">
            {nextTier ? `${nextTier.investors - investorCount} downline(s)` : 'Top tier reached'}
          </p>
        </div>
      </div>

      {/* Salary tiers */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team salary (weekly)</h2>
        <p className="text-sm text-gray-600 mb-4">
          When your team reaches the direct active downline counts below, you get a weekly salary. Claim it and withdraw.
        </p>
        <div className="space-y-3">
          {SALARY_TIERS.map((t) => {
            const reached = investorCount >= t.investors
            return (
              <div
                key={t.investors}
                className={`flex justify-between items-center p-4 rounded-lg border ${reached ? 'border-primary-200 bg-primary-50' : 'border-gray-200'}`}
              >
                <span className="font-medium">{t.label}</span>
                <span className="font-bold text-primary-600">${t.salary.toLocaleString()}/weekly</span>
                {reached && <span className="text-xs text-green-600">✓ Reached</span>}
              </div>
            )
          })}
        </div>
        {currentTier && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              You can claim <strong>${currentTier.salary.toLocaleString()}</strong> this week.
            </p>
            <button
              onClick={() => claimSalary(currentTier.salary)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Claim salary
            </button>
          </div>
        )}
        <p className="text-sm text-gray-500 mt-2">Claimed so far: ${claimedSalary.toLocaleString()}</p>
      </div>

    </div>
  )
}

export default Team

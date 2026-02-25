function Announcements() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#143D59]">Announcements</h1>
        <p className="text-[#1B4965] mt-1">Latest platform updates and notices.</p>
      </div>

      <div className="bg-[#1B4965] rounded-xl border border-[#2b607f] shadow-lg p-6 text-white space-y-3">
        <div className="rounded-lg bg-[#143D59] border border-[#2b607f] p-4">
          <p className="font-semibold">Watch & Earn updates</p>
          <p className="text-sm text-white/75">Ads credit automatically after completed watch time.</p>
        </div>
        <div className="rounded-lg bg-[#143D59] border border-[#2b607f] p-4">
          <p className="font-semibold">Payout processing</p>
          <p className="text-sm text-white/75">Withdrawal requests are reviewed in queue order.</p>
        </div>
      </div>
    </div>
  )
}

export default Announcements

import { useState, useEffect } from 'react'

function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data?.ok && Array.isArray(data.announcements)) {
          setAnnouncements(data.announcements)
        } else {
          setError(data?.error || 'Unable to load announcements.')
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load announcements.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Use first line as title, rest as description; if no newline, whole text is description
  function parseAnnouncement(text) {
    if (!text || typeof text !== 'string') return { title: '', description: '' }
    const trimmed = text.trim()
    const firstNewline = trimmed.indexOf('\n')
    if (firstNewline === -1) return { title: 'Announcement', description: trimmed }
    return {
      title: trimmed.slice(0, firstNewline).trim(),
      description: trimmed.slice(firstNewline + 1).trim(),
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#143D59] dark:text-primary-400">Announcements</h1>
        <p className="text-[#1B4965] dark:text-gray-400 mt-1">Latest platform updates and notices.</p>
      </div>

      {loading && (
        <p className="text-[#1B4965] dark:text-gray-400">Loading announcements...</p>
      )}

      {error && (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      )}

      {!loading && !error && announcements.length === 0 && (
        <div className="bg-[#1B4965] dark:bg-gray-800 rounded-xl border border-[#2b607f] dark:border-gray-700 shadow-lg p-6 text-white dark:text-gray-200">
          <p className="text-white/85 dark:text-gray-400">No announcements yet. Check back later.</p>
        </div>
      )}

      {!loading && !error && announcements.length > 0 && (
        <div className="bg-[#1B4965] dark:bg-gray-800 rounded-xl border border-[#2b607f] dark:border-gray-700 shadow-lg p-6 text-white dark:text-gray-200 space-y-3">
          {announcements.map((item) => {
            const { title, description } = parseAnnouncement(item.text)
            return (
              <div key={item.id} className="rounded-lg bg-[#143D59] dark:bg-gray-700/50 border border-[#2b607f] dark:border-gray-600 p-4">
                <p className="font-semibold dark:text-white">{title}</p>
                <p className="text-sm text-white/75 dark:text-gray-400">{description}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Announcements

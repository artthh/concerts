import { CHANGELOG } from '../lib/changelog.js'

// Month and year only -- a changelog entry doesn't need the day, and several
// entries sharing a date (one working session, shipped in a few steps) would
// otherwise look like a typo.
function formatMonthYear(dateISO) {
  const parsed = Date.parse(String(dateISO) + 'T00:00:00')
  if (Number.isNaN(parsed)) return String(dateISO || '')
  return new Date(parsed).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function ChangelogView() {
  return (
    <div className="changelog">
      {CHANGELOG.map((release) => (
        <section key={release.version} className="changelog__entry">
          <div className="changelog__head">
            <span className="changelog__version">v{release.version}</span>
            <span className="changelog__date">{formatMonthYear(release.date)}</span>
          </div>
          <h3 className="changelog__title">{release.title}</h3>
          <ul className="changelog__items">
            {release.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

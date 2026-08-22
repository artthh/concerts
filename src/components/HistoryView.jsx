import { sortByDate } from '../lib/concerts.js'
import ShowCard from './ShowCard.jsx'

export default function HistoryView({ concerts, lang, t, onOpen }) {
  const sorted = sortByDate(concerts, 'desc')

  if (sorted.length === 0) {
    return <p className="empty">{t('emptyHistory')}</p>
  }

  // Group by year so a long history stays scannable.
  const years = []
  for (const concert of sorted) {
    const year = String(concert.date || '').slice(0, 4) || '—'
    const last = years[years.length - 1]
    if (last && last.year === year) last.items.push(concert)
    else years.push({ year, items: [concert] })
  }

  // Keep the photo side alternating across the whole list, not per year group.
  let position = 0

  return (
    <>
      {years.map((group) => (
        <section className="section" key={group.year}>
          <h2 className="section__title">
            {group.year} · {group.items.length}
          </h2>
          <div className="show-list">
            {group.items.map((concert) => (
              <ShowCard
                key={concert.id}
                concert={concert}
                side={position++ % 2 === 0 ? 'left' : 'right'}
                lang={lang}
                t={t}
                onOpen={onOpen}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

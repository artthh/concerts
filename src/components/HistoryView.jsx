import { sortByDate } from '../lib/concerts.js'
import ShowCard from './ShowCard.jsx'

export default function HistoryView({ concerts, lang, t, onOpen, query, onQuery, searchable }) {
  const sorted = sortByDate(concerts, 'desc')

  // Group by year so a history that spans a decade stays scannable.
  const years = []
  for (const concert of sorted) {
    const year = String(concert.date || '').slice(0, 4) || '—'
    const last = years[years.length - 1]
    if (last && last.year === year) last.items.push(concert)
    else years.push({ year, items: [concert] })
  }

  // Alternate across the whole list, not per year group.
  let position = 0

  return (
    <>
      <h1 className="page-title">{t('navHistory')}</h1>
      {searchable && (
        <input
          className="search"
          type="search"
          value={query}
          placeholder={t('search')}
          onChange={(event) => onQuery(event.target.value)}
        />
      )}
      {sorted.length === 0 ? (
        <p className="empty">{query ? t('noResults') : t('emptyHistory')}</p>
      ) : (
        years.map((group) => (
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
        ))
      )}
    </>
  )
}

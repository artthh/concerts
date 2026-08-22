import { sortByDate } from '../lib/concerts.js'
import ShowCard from './ShowCard.jsx'

// Upcoming shows, soonest first. The photo side alternates by position, so
// adding a show that lands in the middle re-alternates the whole stack.
export default function EventsView({ concerts, lang, t, onOpen }) {
  const sorted = sortByDate(concerts, 'asc')

  return (
    <>
      <h1 className="page-title">{t('navEvents')}</h1>
      {sorted.length === 0 ? (
        <p className="empty">{t('emptyUpcoming')}</p>
      ) : (
        <div className="show-list">
          {sorted.map((concert, index) => (
            <ShowCard
              key={concert.id}
              concert={concert}
              side={index % 2 === 0 ? 'left' : 'right'}
              lang={lang}
              t={t}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </>
  )
}

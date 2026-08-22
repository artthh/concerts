import { sortByDate } from '../lib/concerts.js'
import ShowCard from './ShowCard.jsx'

// The soonest show is the front of the pile: cards overlap upward and each one
// sits above the next, so the stack reads top-down in date order.
export default function UpcomingView({ concerts, lang, t, onOpen }) {
  const sorted = sortByDate(concerts, 'asc')

  if (sorted.length === 0) {
    return <p className="empty">{t('emptyUpcoming')}</p>
  }

  return (
    <div className="pile">
      {sorted.map((concert, index) => (
        <div className="pile__item" key={concert.id} style={{ zIndex: sorted.length - index }}>
          <ShowCard
            concert={concert}
            side={index % 2 === 0 ? 'left' : 'right'}
            lang={lang}
            t={t}
            onOpen={onOpen}
          />
        </div>
      ))}
    </div>
  )
}

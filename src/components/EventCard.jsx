import { daysUntil } from '../lib/events.js'
import { formatEventDate, t } from '../lib/i18n.js'

// One event row. `side` decides which edge the photo sits on; the photo is
// clipped to a diagonal and feathered into the card so it bleeds inward.
export default function EventCard({ event, side, onOpen }) {
  const delta = daysUntil(event)
  const past = delta !== null && delta < 0

  // A plain count reads better than "in 1 days"; today and tomorrow get words.
  let count = String(Math.abs(delta ?? 0))
  let label = past ? t('daysSince') : t('daysLeft')
  if (delta === 0) {
    count = t('today')
    label = ''
  } else if (delta === 1) {
    count = t('tomorrow')
    label = ''
  } else if (delta === -1) {
    count = t('yesterday')
    label = ''
  }

  return (
    <button type="button" className={`show show--${side}`} onClick={() => onOpen(event)}>
      <span className="show__photo">
        {event.photo ? (
          <img src={event.photo} alt="" />
        ) : (
          <span className="show__photo-empty" aria-hidden="true">
            {t(`kindIcon_${event.kind}`)}
          </span>
        )}
      </span>
      <span className="show__body">
        <span className="show__artist">
          {event.title || '—'}
          {event.emoji && <span className="show__emoji"> {event.emoji}</span>}
        </span>
        {event.venue && <span className="show__venue">{event.venue}</span>}
        <span className="show__date">{formatEventDate(event.date)}</span>
        <span className="show__count">
          <span className={label ? 'show__count-n' : 'show__count-n show__count-n--word'}>
            {count}
          </span>
          {label && <span className="show__count-label">{label}</span>}
        </span>
      </span>
    </button>
  )
}

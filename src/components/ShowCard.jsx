import { daysUntil } from '../lib/concerts.js'
import { formatEventDate } from '../lib/i18n.js'

// One event row. `side` decides which edge the artist photo sits on; the photo
// is clipped to a diagonal and feathered into the card so it bleeds inward.
export default function ShowCard({ concert, side, lang, t, onOpen }) {
  const delta = daysUntil(concert)
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
    <button type="button" className={`show show--${side}`} onClick={() => onOpen(concert)}>
      <span className="show__photo">
        {concert.photo ? (
          <img src={concert.photo} alt="" />
        ) : (
          <span className="show__photo-empty" aria-hidden="true">
            🎤
          </span>
        )}
      </span>
      <span className="show__body">
        <span className="show__artist">
          {concert.artist || '—'}
          {concert.emoji && <span className="show__emoji"> {concert.emoji}</span>}
        </span>
        <span className="show__date">{formatEventDate(concert.date, lang)}</span>
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

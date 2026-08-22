import { daysUntil, place } from '../lib/concerts.js'
import { formatDate } from '../lib/i18n.js'
import Stars from './Stars.jsx'

// One card in the pile. `side` decides which edge the artist photo sits on so
// consecutive cards mirror each other; the caller alternates it by position.
export default function ShowCard({ concert, side, lang, t, onOpen, style }) {
  const delta = daysUntil(concert)
  const past = delta !== null && delta < 0
  const count = past ? Math.abs(delta) : delta

  // "Today" and "tomorrow" read better as words than as a 0 or a 1.
  let big = String(count ?? '—')
  let label = past ? t('daysSince') : t('daysLeft')
  if (delta === 0) {
    big = t('today')
    label = ''
  } else if (delta === 1) {
    big = t('tomorrow')
    label = ''
  } else if (delta === -1) {
    big = t('yesterday')
    label = ''
  }
  const isWord = label === ''

  return (
    <button
      type="button"
      className={`show show--${side}`}
      style={style}
      onClick={() => onOpen(concert)}
    >
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
        <span className={isWord ? 'show__count show__count--word' : 'show__count'}>{big}</span>
        {label && <span className="show__count-label">{label}</span>}
        <span className="show__artist">{concert.artist || '—'}</span>
        <span className="show__meta">{formatDate(concert.date, lang)}</span>
        <span className="show__meta">{place(concert) || concert.tour}</span>
        {concert.rating > 0 && <Stars value={concert.rating} />}
      </span>
    </button>
  )
}

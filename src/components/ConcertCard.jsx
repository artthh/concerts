import { daysUntil, place } from '../lib/concerts.js'
import { relativeDays } from '../lib/i18n.js'
import Stars from './Stars.jsx'

const MONTHS = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
}

export default function ConcertCard({ concert, lang, t, onOpen, showCountdown }) {
  const [year, month, day] = String(concert.date || '').split('-')
  const monthLabel = MONTHS[lang === 'en' ? 'en' : 'es'][Number(month) - 1] || ''
  const delta = daysUntil(concert)

  return (
    <button type="button" className="concert" onClick={() => onOpen(concert)}>
      <div className="concert__date">
        <div className="concert__day">{day || '—'}</div>
        <div className="concert__month">{monthLabel}</div>
      </div>
      <div className="concert__body">
        <div className="concert__artist">{concert.artist || '—'}</div>
        <div className="concert__meta">{place(concert) || concert.tour || year}</div>
        {concert.rating > 0 && <Stars value={concert.rating} />}
      </div>
      <div className="concert__aside">
        {showCountdown ? relativeDays(delta, t) : year}
      </div>
    </button>
  )
}

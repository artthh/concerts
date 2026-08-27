import { daysUntil, isUpcoming, sortByDate } from '../lib/events.js'
import { formatEventDate } from '../lib/i18n.js'
import StatsView from './StatsView.jsx'

// Shared by the hero and the tiles: the number is the point, so today and
// tomorrow become words and everything else is a plain count.
function countdown(event, t) {
  const delta = daysUntil(event)
  if (delta === 0) return { value: t('today'), label: '', word: true }
  if (delta === 1) return { value: t('tomorrow'), label: '', word: true }
  return { value: String(Math.abs(delta ?? 0)), label: t('daysLeft'), word: false }
}

function Hero({ event, lang, t, onOpen }) {
  const { value, label, word } = countdown(event, t)
  return (
    <button type="button" className="hero" onClick={() => onOpen(event)}>
      {event.photo ? (
        <img className="hero__photo" src={event.photo} alt="" />
      ) : (
        <span className="hero__photo hero__photo--empty" aria-hidden="true">
          {t(`kindIcon_${event.kind}`)}
        </span>
      )}
      <span className="hero__scrim" />
      <span className="hero__body">
        <span className="hero__kind">{t(`kind_${event.kind}`)}</span>
        <span className="hero__title">
          {event.title}
          {event.emoji && <span className="hero__emoji"> {event.emoji}</span>}
        </span>
        {event.venue && <span className="hero__meta">{event.venue}</span>}
        <span className="hero__meta">{formatEventDate(event.date, lang)}</span>
        <span className="hero__count">
          <span className={word ? 'hero__count-n hero__count-n--word' : 'hero__count-n'}>
            {value}
          </span>
          {label && <span className="hero__count-label">{label}</span>}
        </span>
      </span>
    </button>
  )
}

function Tile({ event, lang, t, onOpen }) {
  const { value, label, word } = countdown(event, t)
  return (
    <button type="button" className="tile" onClick={() => onOpen(event)}>
      {event.photo ? (
        <img className="tile__photo" src={event.photo} alt="" />
      ) : (
        <span className="tile__photo tile__photo--empty" aria-hidden="true">
          {t(`kindIcon_${event.kind}`)}
        </span>
      )}
      <span className="tile__scrim" />
      <span className="tile__body">
        <span className="tile__count">
          <span className={word ? 'tile__count-n tile__count-n--word' : 'tile__count-n'}>
            {value}
          </span>
          {label && <span className="tile__count-label">{label}</span>}
        </span>
        <span className="tile__title">
          {event.title}
          {event.emoji && <span> {event.emoji}</span>}
        </span>
        <span className="tile__meta">{event.venue || formatEventDate(event.date, lang)}</span>
      </span>
    </button>
  )
}

// The overview: the very next event large, then the ones after it as a grid,
// then the running numbers.
export default function HomeView({ events, lang, t, onOpen }) {
  const upcoming = sortByDate(events.filter((e) => isUpcoming(e)), 'asc')
  const [next, ...rest] = upcoming

  return (
    <>
      <h1 className="page-title">{t('navHome')}</h1>

      {next ? (
        <>
          <h2 className="section__title">{t('nextUp')}</h2>
          <Hero event={next} lang={lang} t={t} onOpen={onOpen} />
        </>
      ) : (
        <p className="empty">{t('emptyUpcoming')}</p>
      )}

      {rest.length > 0 && (
        <section className="section">
          <h2 className="section__title">{t('thenComes')}</h2>
          <div className="tile-grid">
            {rest.map((event) => (
              <Tile key={event.id} event={event} lang={lang} t={t} onOpen={onOpen} />
            ))}
          </div>
        </section>
      )}

      <StatsView events={events} lang={lang} t={t} />
    </>
  )
}

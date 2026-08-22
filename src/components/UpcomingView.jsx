import { daysUntil, place, sortByDate } from '../lib/concerts.js'
import { formatDate, relativeDays } from '../lib/i18n.js'
import ConcertList from './ConcertList.jsx'

export default function UpcomingView({ concerts, lang, t, onOpen }) {
  const sorted = sortByDate(concerts, 'asc')
  const [next, ...rest] = sorted

  return (
    <>
      {next && (
        <section className="hero">
          <div className="hero__label">{t('nextUp')}</div>
          <div className="hero__artist">{next.artist}</div>
          <div className="hero__meta">{formatDate(next.date, lang)}</div>
          <div className="hero__meta">{place(next) || next.tour}</div>
          <div className="hero__countdown">{relativeDays(daysUntil(next), t)}</div>
        </section>
      )}

      <section className="section">
        {rest.length > 0 && <h2 className="section__title">{t('tabUpcoming')}</h2>}
        <ConcertList
          concerts={next ? rest : sorted}
          lang={lang}
          t={t}
          onOpen={onOpen}
          showCountdown
          emptyMessage={next ? '' : t('emptyUpcoming')}
        />
      </section>
    </>
  )
}

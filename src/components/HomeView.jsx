import { isUpcoming, sortByDate } from '../lib/concerts.js'
import ShowCard from './ShowCard.jsx'
import StatsView from './StatsView.jsx'

// The overview: the show that is closest, then the running numbers.
export default function HomeView({ concerts, lang, t, onOpen }) {
  const next = sortByDate(concerts.filter((c) => isUpcoming(c)), 'asc')[0] || null

  return (
    <>
      <h1 className="page-title">{t('navHome')}</h1>

      {next && (
        <section className="section section--tight">
          <h2 className="section__title">{t('nextUp')}</h2>
          <ShowCard concert={next} side="left" lang={lang} t={t} onOpen={onOpen} />
        </section>
      )}

      <StatsView concerts={concerts} lang={lang} t={t} />
    </>
  )
}

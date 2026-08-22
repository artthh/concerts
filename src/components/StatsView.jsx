import { buildStats } from '../lib/concerts.js'
import { formatMoney } from '../lib/i18n.js'
import Stars from './Stars.jsx'

function Bars({ rows }) {
  const max = rows.reduce((m, [, count]) => Math.max(m, count), 0) || 1
  return (
    <div className="bars">
      {rows.map(([label, count]) => (
        <div className="bar" key={label}>
          <span className="bar__label">{label}</span>
          <span className="bar__track">
            <span className="bar__fill" style={{ width: `${(count / max) * 100}%` }} />
          </span>
          <span className="bar__count">{count}</span>
        </div>
      ))}
    </div>
  )
}

export default function StatsView({ concerts, lang, t }) {
  if (concerts.length === 0) {
    return <p className="empty">{t('emptyStats')}</p>
  }

  const stats = buildStats(concerts)

  return (
    <>
      <section className="section">
        <div className="stat-grid">
          <div className="stat">
            <div className="stat__value">{stats.total}</div>
            <div className="stat__label">{t('total')}</div>
          </div>
          <div className="stat">
            <div className="stat__value">{stats.pastCount}</div>
            <div className="stat__label">{t('pastCount')}</div>
          </div>
          <div className="stat">
            <div className="stat__value">{stats.artists.length}</div>
            <div className="stat__label">{t('uniqueArtists')}</div>
          </div>
          <div className="stat">
            <div className="stat__value">{stats.cities.length}</div>
            <div className="stat__label">{t('uniqueCities')}</div>
          </div>
        </div>
      </section>

      {stats.averageRating !== null && (
        <section className="section">
          <h2 className="section__title">{t('averageRating')}</h2>
          <div className="stat">
            <div className="stat__value">{stats.averageRating.toFixed(1)} / 5</div>
          </div>
        </section>
      )}

      {stats.spendByCurrency.length > 0 && (
        <section className="section">
          <h2 className="section__title">{t('spend')}</h2>
          <div className="stat-grid">
            {stats.spendByCurrency.map(([currency, amount]) => (
              <div className="stat" key={currency}>
                <div className="stat__value">{formatMoney(amount, currency, lang)}</div>
                <div className="stat__label">{currency}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {stats.byYear.length > 0 && (
        <section className="section">
          <h2 className="section__title">{t('perYear')}</h2>
          <div className="card">
            <Bars rows={stats.byYear} />
          </div>
        </section>
      )}

      {stats.artists.length > 1 && (
        <section className="section">
          <h2 className="section__title">{t('topArtists')}</h2>
          <div className="card">
            <Bars rows={stats.artists.slice(0, 8)} />
          </div>
        </section>
      )}

      {stats.cities.length > 1 && (
        <section className="section">
          <h2 className="section__title">{t('topCities')}</h2>
          <div className="card">
            <Bars rows={stats.cities.slice(0, 8)} />
          </div>
        </section>
      )}

      {stats.company.length > 0 && (
        <section className="section">
          <h2 className="section__title">{t('topCompany')}</h2>
          <div className="card">
            <Bars rows={stats.company.slice(0, 8)} />
          </div>
        </section>
      )}

      {stats.topRated.length > 0 && (
        <section className="section">
          <h2 className="section__title">{t('bestRated')}</h2>
          <div className="card">
            {stats.topRated.map((concert) => (
              <div className="detail__row" key={concert.id}>
                <span className="bar__label">{concert.artist}</span>
                <Stars value={concert.rating} />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

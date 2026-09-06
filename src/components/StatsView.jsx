import { KINDS, buildKindStats, buildStats } from '../lib/events.js'
import { formatMoney, ordinal, t } from '../lib/i18n.js'
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

// One row of a glimpse card: an icon, a label, and whatever value fits --
// text, stars, or nothing, in which case the row is skipped entirely.
function Highlight({ icon, label, children }) {
  if (!children) return null
  return (
    <div className="glimpse__row">
      <span className="glimpse__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="glimpse__label">{label}</span>
      <span className="glimpse__value">{children}</span>
    </div>
  )
}

// What is worth surfacing depends on which fields a category actually uses --
// a top venue means something for a concert and nothing for an anniversary.
function Glimpse({ stats }) {
  const { kind } = stats
  return (
    <div className="glimpse">
      <div className="glimpse__header">
        <span className="glimpse__title">
          <span aria-hidden="true">{t(`kindIcon_${kind}`)}</span> {t(`kindPlural_${kind}`)}
        </span>
        <span className="glimpse__count">{stats.total}</span>
      </div>
      <div className="glimpse__sub">
        {kind === 'anniversary'
          ? t('glimpseTracked', { n: stats.total })
          : `${t('glimpseAttended', { n: stats.pastCount })} · ${t('glimpseUpcoming', {
              n: stats.upcomingCount,
            })}`}
      </div>

      {kind === 'anniversary' && stats.longestRunning && (
        <Highlight icon="🎂" label={t('longestRunning')}>
          {t('longestRunningValue', {
            title: stats.longestRunning.title,
            nth: ordinal(stats.longestRunning.nth),
          })}
        </Highlight>
      )}

      {kind === 'plan' && stats.total > 0 && (
        <Highlight icon="🔁" label={t('repeat')}>
          {t('repeatingBreakdown', { repeating: stats.repeatingCount, oneOff: stats.oneOffCount })}
        </Highlight>
      )}

      {(kind === 'plan' || kind === 'concert' || kind === 'movie' || kind === 'show') &&
        stats.next && <Highlight icon="⏭️" label={t('nextUp')}>{stats.next.title}</Highlight>}

      {stats.venues.length > 0 && (
        <Highlight icon="📍" label={t('topVenue')}>
          {stats.venues[0][0]}
          {stats.venues[0][1] > 1 ? ` (${stats.venues[0][1]})` : ''}
        </Highlight>
      )}

      {kind === 'concert' && stats.titles.length > 1 && (
        <Highlight icon="🎤" label={t('mostSeen')}>
          {stats.titles[0][0]} ({stats.titles[0][1]})
        </Highlight>
      )}

      {kind === 'concert' && stats.averageRating !== null && (
        <Highlight icon="⭐" label={t('averageRating')}>
          {stats.averageRating.toFixed(1)} <Stars value={Math.round(stats.averageRating)} />
        </Highlight>
      )}

      {kind === 'concert' && stats.spendByCurrency.length > 0 && (
        <Highlight icon="💳" label={t('spend')}>
          {stats.spendByCurrency.map(([currency, amount]) => formatMoney(amount, currency)).join(' + ')}
        </Highlight>
      )}
    </div>
  )
}

export default function StatsView({ events }) {
  if (events.length === 0) {
    return <p className="empty">{t('emptyStats')}</p>
  }

  const stats = buildStats(events)
  // Only the categories actually in use get a glimpse -- an empty card is
  // just noise.
  const kindStats = KINDS.map((kind) => buildKindStats(events, kind)).filter((s) => s.total > 0)

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
            <div className="stat__value">{stats.upcomingCount}</div>
            <div className="stat__label">{t('upcomingCount')}</div>
          </div>
        </div>
      </section>

      {stats.byYear.length > 0 && (
        <section className="section">
          <h2 className="section__title">{t('perYear')}</h2>
          <div className="card">
            <Bars rows={stats.byYear} />
          </div>
        </section>
      )}

      {kindStats.length > 0 && (
        <section className="section">
          <h2 className="section__title">{t('byCategory')}</h2>
          <div className="glimpse-grid">
            {kindStats.map((s) => (
              <Glimpse key={s.kind} stats={s} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

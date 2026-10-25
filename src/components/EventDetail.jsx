import {
  KINDS_WITH_EXTRAS,
  daysUntil,
  isUpcoming,
  nextOccurrence,
  occurrenceNumber,
} from '../lib/events.js'
import {
  formatDate,
  formatEventDate,
  formatMoney,
  ordinal,
  ordinalSuffix,
  relativeDays,
  t,
} from '../lib/i18n.js'
import { CloseIcon } from './Icons.jsx'
import Modal from './Modal.jsx'
import Stars from './Stars.jsx'

function Row({ label, children }) {
  if (!children) return null
  return (
    <div className="detail__row">
      <span className="detail__key">{label}</span>
      <span>{children}</span>
    </div>
  )
}

// Same today/tomorrow/yesterday-as-words treatment as the cards and tiles,
// since this is the one screen most likely to end up as a screenshot.
function countdown(event) {
  const delta = daysUntil(event)
  const past = delta !== null && delta < 0
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
  return { count, label, word: label === '' }
}

// The event's own share card: a poster-style hero rather than a plain,
// very wide-and-short rectangle, so a screenshot taken straight off this
// screen is something worth sharing.
function DetailHero({ event, onClose }) {
  const { count, label, word } = countdown(event)
  const nth = occurrenceNumber(event)

  return (
    <div className="detail-hero">
      {event.photo ? (
        <img className="detail-hero__photo" src={event.photo} alt="" />
      ) : (
        <span className="detail-hero__photo detail-hero__photo--empty" aria-hidden="true">
          {t(`kindIcon_${event.kind}`)}
        </span>
      )}
      <span className="detail-hero__scrim" />
      <button
        type="button"
        className="detail-hero__close"
        onClick={onClose}
        aria-label={t('close')}
      >
        <CloseIcon width={18} height={18} />
      </button>
      {nth !== null && (
        <span className="nth nth--detail" aria-label={t('nthYear', { n: nth })}>
          {nth}
          <span className="nth__suffix">{ordinalSuffix(nth)}</span>
        </span>
      )}
      <span className="detail-hero__body">
        <span className="detail-hero__kind">{t(`kind_${event.kind}`)}</span>
        <span className="detail-hero__title">
          {event.title}
          {event.emoji && <span className="detail-hero__emoji"> {event.emoji}</span>}
        </span>
        {event.venue && <span className="detail-hero__meta">{event.venue}</span>}
        <span className="detail-hero__meta">{formatEventDate(nextOccurrence(event))}</span>
        <span className="detail-hero__count">
          <span
            className={
              word ? 'detail-hero__count-n detail-hero__count-n--word' : 'detail-hero__count-n'
            }
          >
            {count}
          </span>
          {label && <span className="detail-hero__count-label">{label}</span>}
        </span>
      </span>
    </div>
  )
}

export default function EventDetail({ event, onEdit, onDelete, onClose }) {
  const hasExtras = KINDS_WITH_EXTRAS.has(event.kind)
  const repeats = (event.repeat || 'none') !== 'none'
  const nth = occurrenceNumber(event)

  return (
    <Modal title={event.title} onClose={onClose} closeLabel={t('close')} noHeader>
      <DetailHero event={event} onClose={onClose} />
      <div className="detail__meta">
        <Row label={t('category')}>{t(`kind_${event.kind}`)}</Row>
        <Row label={repeats ? t('originDateLabel') : t('date')}>
          {formatDate(event.date)}
          {event.time ? ` · ${event.time}` : ''}
        </Row>
        {repeats && <Row label={t('repeat')}>{t(`repeat_${event.repeat}`)}</Row>}
        {repeats && <Row label={t('nextUp')}>{formatDate(nextOccurrence(event))}</Row>}
        {nth !== null && <Row label={t('occurrenceLabel')}>{ordinal(nth)}</Row>}
        <Row label={isUpcoming(event) ? t('countdown') : t('daysSince')}>
          {relativeDays(daysUntil(event))}
        </Row>
        <Row label={t(`venueLabel_${event.kind}`)}>{event.venue}</Row>
        {hasExtras && (
          <>
            <Row label={t('tour')}>{event.tour}</Row>
            <Row label={t('city')}>{[event.city, event.country].filter(Boolean).join(', ')}</Row>
            <Row label={t('seat')}>{event.seat}</Row>
            <Row label={t('price')}>{formatMoney(event.price, event.currency)}</Row>
            <Row label={t('openers')}>{event.openers.join(', ')}</Row>
            <Row label={t('company')}>{event.company.join(', ')}</Row>
          </>
        )}
        <Row label={t('rating')}>{event.rating > 0 ? <Stars value={event.rating} /> : null}</Row>
        <Row label={t('notes')}>{event.notes}</Row>
        <Row label={t('ticketUrl')}>
          {event.ticketUrl ? (
            <a href={event.ticketUrl} target="_blank" rel="noreferrer">
              {event.ticketUrl}
            </a>
          ) : null}
        </Row>
      </div>

      {event.setlist.length > 0 && (
        <section className="section" style={{ marginTop: 0 }}>
          <h3 className="section__title">{t('setlist')}</h3>
          <ol className="detail__setlist">
            {event.setlist.map((song, index) => (
              <li key={`${song}-${index}`}>{song}</li>
            ))}
          </ol>
        </section>
      )}

      <div className="modal__actions">
        <button
          type="button"
          className="button button--danger"
          onClick={() => {
            if (window.confirm(t('confirmDelete'))) onDelete(event.id)
          }}
        >
          {t('delete')}
        </button>
        <button type="button" className="button button--primary" onClick={() => onEdit(event)}>
          {t('edit')}
        </button>
      </div>
    </Modal>
  )
}

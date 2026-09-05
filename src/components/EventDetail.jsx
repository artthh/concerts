import {
  KINDS_WITH_EXTRAS,
  daysUntil,
  isUpcoming,
  nextOccurrence,
  occurrenceNumber,
} from '../lib/events.js'
import { formatDate, formatMoney, ordinal, relativeDays, t } from '../lib/i18n.js'
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

export default function EventDetail({ event, onEdit, onDelete, onClose }) {
  const hasExtras = KINDS_WITH_EXTRAS.has(event.kind)
  const repeats = (event.repeat || 'none') !== 'none'
  const nth = occurrenceNumber(event)

  return (
    <Modal title={event.title} onClose={onClose} closeLabel={t('close')}>
      {event.photo && <img className="detail__photo" src={event.photo} alt="" />}
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

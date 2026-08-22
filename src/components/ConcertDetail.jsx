import { daysUntil, isUpcoming } from '../lib/concerts.js'
import { formatDate, formatMoney, relativeDays } from '../lib/i18n.js'
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

export default function ConcertDetail({ concert, lang, t, onEdit, onDelete, onClose }) {
  return (
    <Modal title={concert.artist} onClose={onClose} closeLabel={t('close')}>
      <div className="detail__meta">
        <Row label={t('date')}>
          {formatDate(concert.date, lang)}
          {concert.time ? ` · ${concert.time}` : ''}
        </Row>
        {isUpcoming(concert) && <Row label={t('countdown')}>{relativeDays(daysUntil(concert), t)}</Row>}
        <Row label={t('tour')}>{concert.tour}</Row>
        <Row label={t('venue')}>{concert.venue}</Row>
        <Row label={t('city')}>{[concert.city, concert.country].filter(Boolean).join(', ')}</Row>
        <Row label={t('seat')}>{concert.seat}</Row>
        <Row label={t('price')}>{formatMoney(concert.price, concert.currency, lang)}</Row>
        <Row label={t('openers')}>{concert.openers.join(', ')}</Row>
        <Row label={t('company')}>{concert.company.join(', ')}</Row>
        <Row label={t('rating')}>{concert.rating > 0 ? <Stars value={concert.rating} /> : null}</Row>
        <Row label={t('notes')}>{concert.notes}</Row>
        <Row label={t('ticketUrl')}>
          {concert.ticketUrl ? (
            <a href={concert.ticketUrl} target="_blank" rel="noreferrer">
              {concert.ticketUrl}
            </a>
          ) : null}
        </Row>
      </div>

      {concert.setlist.length > 0 && (
        <section className="section" style={{ marginTop: 0 }}>
          <h3 className="section__title">{t('setlist')}</h3>
          <ol className="detail__setlist">
            {concert.setlist.map((song, index) => (
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
            if (window.confirm(t('confirmDelete'))) onDelete(concert.id)
          }}
        >
          {t('delete')}
        </button>
        <button type="button" className="button button--primary" onClick={() => onEdit(concert)}>
          {t('edit')}
        </button>
      </div>
    </Modal>
  )
}

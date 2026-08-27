import { useState } from 'react'
import { CURRENCIES, KINDS, KINDS_WITH_EXTRAS, emptyEvent, normalizeEvent } from '../lib/events.js'
import { t } from '../lib/i18n.js'
import Modal from './Modal.jsx'
import PhotoPicker from './PhotoPicker.jsx'

// Lists live as arrays in the record but are edited as free text.
const toText = (list) => (Array.isArray(list) ? list.join('\n') : String(list || ''))

export default function EventForm({ event, defaultKind, onSave, onClose, onError }) {
  const [draft, setDraft] = useState(() => ({
    ...emptyEvent(event?.kind || defaultKind),
    ...(event || {}),
    openersText: toText(event?.openers),
    companyText: toText(event?.company),
    setlistText: toText(event?.setlist),
  }))
  const [error, setError] = useState('')
  // Concerts have a long tail of optional fields; movies and shows are just
  // name, photo, date and venue, so there is nothing to fold away for them.
  const [showExtras, setShowExtras] = useState(false)
  const hasExtras = KINDS_WITH_EXTRAS.has(draft.kind)

  const set = (key) => (event_) => setDraft((d) => ({ ...d, [key]: event_.target.value }))

  function submit(submitEvent) {
    submitEvent.preventDefault()
    if (!draft.title.trim()) {
      setError(t(`titleRequired_${draft.kind}`))
      return
    }
    onSave(
      normalizeEvent({
        ...draft,
        openers: draft.openersText,
        company: draft.companyText,
        setlist: draft.setlistText,
      }),
    )
  }

  return (
    <Modal title={event?.id ? t('edit') : t('add')} onClose={onClose} closeLabel={t('close')}>
      <form onSubmit={submit}>
        <div className="field">
          <span className="field__label">{t('category')}</span>
          <div className="kind-picker">
            {KINDS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={draft.kind === option}
                onClick={() => setDraft((d) => ({ ...d, kind: option }))}
              >
                <span aria-hidden="true">{t(`kindIcon_${option}`)}</span>
                {t(`kind_${option}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="title">
            {t(`titleLabel_${draft.kind}`)}
          </label>
          <input id="title" className="input" value={draft.title} onChange={set('title')} autoFocus />
          {error && <div className="field__error">{error}</div>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="emoji">
            {t('emoji')}
          </label>
          <input
            id="emoji"
            className="input input--emoji"
            value={draft.emoji}
            onChange={set('emoji')}
            maxLength={4}
          />
          <div className="field__hint">{t('emojiHint')}</div>
        </div>

        <div className="field">
          <span className="field__label">{t(`photoLabel_${draft.kind}`)}</span>
          <PhotoPicker
            value={draft.photo}
            onChange={(photo) => setDraft((d) => ({ ...d, photo }))}
            onError={onError}
          />
          <div className="field__hint">{t('photoHint')}</div>
        </div>

        {hasExtras ? (
          <div className="field-row">
            <div className="field">
              <label className="field__label" htmlFor="date">
                {t('date')}
              </label>
              <input id="date" type="date" className="input" value={draft.date} onChange={set('date')} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="time">
                {t('time')}
              </label>
              <input id="time" type="time" className="input" value={draft.time} onChange={set('time')} />
            </div>
          </div>
        ) : (
          <div className="field">
            <label className="field__label" htmlFor="date">
              {t('date')}
            </label>
            <input id="date" type="date" className="input" value={draft.date} onChange={set('date')} />
          </div>
        )}

        <div className="field">
          <label className="field__label" htmlFor="venue">
            {t(`venueLabel_${draft.kind}`)}
          </label>
          <input id="venue" className="input" value={draft.venue} onChange={set('venue')} />
        </div>

        {hasExtras && (
          <button
            type="button"
            className="button"
            onClick={() => setShowExtras((v) => !v)}
            aria-expanded={showExtras}
          >
            {showExtras ? t('hideDetails') : t('moreDetails')}
          </button>
        )}

        {hasExtras && showExtras && (
          <div className="form-extras">
            <div className="field">
              <label className="field__label" htmlFor="tour">
                {t('tour')}
              </label>
              <input id="tour" className="input" value={draft.tour} onChange={set('tour')} />
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field__label" htmlFor="city">
                  {t('city')}
                </label>
                <input id="city" className="input" value={draft.city} onChange={set('city')} />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="country">
                  {t('country')}
                </label>
                <input id="country" className="input" value={draft.country} onChange={set('country')} />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field__label" htmlFor="price">
                  {t('price')}
                </label>
                <input
                  id="price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  className="input"
                  value={draft.price ?? ''}
                  onChange={set('price')}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="currency">
                  {t('currency')}
                </label>
                <select id="currency" className="select" value={draft.currency} onChange={set('currency')}>
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="seat">
                {t('seat')}
              </label>
              <input id="seat" className="input" value={draft.seat} onChange={set('seat')} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="openers">
                {t('openers')}
              </label>
              <textarea
                id="openers"
                className="textarea"
                value={draft.openersText}
                onChange={set('openersText')}
              />
              <div className="field__hint">{t('listHint')}</div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="company">
                {t('company')}
              </label>
              <textarea
                id="company"
                className="textarea"
                value={draft.companyText}
                onChange={set('companyText')}
              />
              <div className="field__hint">{t('listHint')}</div>
            </div>

            <div className="field">
              <span className="field__label">{t('rating')}</span>
              <div className="rating-picker">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={draft.rating >= value}
                    aria-label={`${value}/5`}
                    onClick={() => setDraft((d) => ({ ...d, rating: d.rating === value ? 0 : value }))}
                  >
                    {draft.rating >= value ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="setlist">
                {t('setlist')}
              </label>
              <textarea
                id="setlist"
                className="textarea"
                value={draft.setlistText}
                onChange={set('setlistText')}
              />
              <div className="field__hint">{t('setlistHint')}</div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="notes">
                {t('notes')}
              </label>
              <textarea id="notes" className="textarea" value={draft.notes} onChange={set('notes')} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="ticketUrl">
                {t('ticketUrl')}
              </label>
              <input
                id="ticketUrl"
                type="url"
                inputMode="url"
                className="input"
                value={draft.ticketUrl}
                onChange={set('ticketUrl')}
              />
            </div>
          </div>
        )}

        <div className="modal__actions">
          <button type="button" className="button" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="button button--primary">
            {t('save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

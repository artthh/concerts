import { nextOccurrence } from '../lib/events.js'
import { formatEventDate, t } from '../lib/i18n.js'
import Modal from './Modal.jsx'

// What a share link opens into: a preview of the event it carries, with a
// choice to add it (a fresh, independent copy) or walk away from it.
export default function SharedEventPrompt({ event, onAccept, onDiscard }) {
  return (
    <Modal title={t('sharedEventTitle')} onClose={onDiscard} closeLabel={t('close')}>
      <div className="shared-preview">
        <span className="shared-preview__icon" aria-hidden="true">
          {t(`kindIcon_${event.kind}`)}
        </span>
        <div className="shared-preview__body">
          <span className="shared-preview__name">
            {event.title}
            {event.emoji ? ` ${event.emoji}` : ''}
          </span>
          {event.venue && <span className="shared-preview__meta">{event.venue}</span>}
          <span className="shared-preview__meta">{formatEventDate(nextOccurrence(event))}</span>
        </div>
      </div>
      <p className="field__hint">{t('sharedEventHint')}</p>
      <div className="modal__actions">
        <button type="button" className="button" onClick={onDiscard}>
          {t('discard')}
        </button>
        <button type="button" className="button button--primary" onClick={onAccept}>
          {t('addSharedEvent')}
        </button>
      </div>
    </Modal>
  )
}

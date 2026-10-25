import { useEffect } from 'react'

export default function Modal({ title, onClose, closeLabel, children, noHeader }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div className="modal" onClick={onClose} role="presentation">
      <div
        className="modal__sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Dropped for a share-worthy screen like EventDetail's -- the close
            affordance moves into the content itself instead (a floating
            button over the photo), so there is no header bar sitting above
            the one thing worth screenshotting. aria-label above still
            names the dialog either way. */}
        {!noHeader && (
          <div className="modal__head">
            <h2 className="modal__title">{title}</h2>
            <button type="button" className="chip-button" onClick={onClose}>
              {closeLabel}
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

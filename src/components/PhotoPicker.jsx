import { useRef, useState } from 'react'
import { PHOTO_SIZE } from '../lib/photos.js'
import { t } from '../lib/i18n.js'
import PhotoCropper from './PhotoCropper.jsx'

// Every photo is cropped by hand, not just auto-centred: the picked file
// opens PhotoCropper first, and only its confirmed result ever reaches
// onChange, so the preview here is exactly what gets stored and shown on
// the cards.
export default function PhotoPicker({
  value,
  placeholder = '🎤',
  width = PHOTO_SIZE,
  height = PHOTO_SIZE,
  round = false,
  onChange,
  onError,
}) {
  const input = useRef(null)
  const [pending, setPending] = useState(null)

  function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) setPending(file)
  }

  return (
    <div className={round ? 'photo-picker photo-picker--round' : 'photo-picker'}>
      <button
        type="button"
        className={value ? 'photo-picker__preview' : 'photo-picker__preview photo-picker__preview--empty'}
        onClick={() => input.current?.click()}
        aria-label={value ? t('changePhoto') : t('addPhoto')}
      >
        {value ? <img src={value} alt="" /> : <span aria-hidden="true">{placeholder}</span>}
      </button>
      <div className="photo-picker__actions">
        <button type="button" className="chip-button" onClick={() => input.current?.click()}>
          {value ? t('changePhoto') : t('addPhoto')}
        </button>
        {value && (
          <button type="button" className="chip-button" onClick={() => onChange('')}>
            {t('removePhoto')}
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />
      {pending && (
        <PhotoCropper
          file={pending}
          width={width}
          height={height}
          round={round}
          onCancel={() => setPending(null)}
          onConfirm={(dataUrl) => {
            setPending(null)
            onChange(dataUrl)
          }}
          onError={() => {
            setPending(null)
            onError(t('photoFailed'))
          }}
        />
      )}
    </div>
  )
}

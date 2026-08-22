import { useRef, useState } from 'react'
import { preparePhoto } from '../lib/photos.js'

// Crops the picked file straight away so the preview is exactly what gets
// stored and shown on the cards.
export default function PhotoPicker({ value, t, onChange, onError }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      onChange(await preparePhoto(file))
    } catch {
      onError(t('photoFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="photo-picker">
      <button
        type="button"
        className={value ? 'photo-picker__preview' : 'photo-picker__preview photo-picker__preview--empty'}
        onClick={() => input.current?.click()}
        aria-label={value ? t('changePhoto') : t('addPhoto')}
      >
        {value ? <img src={value} alt="" /> : <span aria-hidden="true">🎤</span>}
        {busy && <span className="photo-picker__busy">…</span>}
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
    </div>
  )
}

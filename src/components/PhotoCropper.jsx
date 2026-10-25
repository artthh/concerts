import { useEffect, useRef, useState } from 'react'
import { t } from '../lib/i18n.js'

const MIN_ZOOM = 1
const MAX_ZOOM = 4

// The smallest scale that still covers the frame with no empty edge --
// "zoom 1" in the slider, same thing object-fit: cover would pick on its own.
function baseScale(natural, frame) {
  return Math.max(frame / natural.w, frame / natural.h)
}

// However far the image can pan at this zoom before an empty edge would
// show -- half of however much it currently overhangs the frame, per axis.
function clampPan(pan, zoom, natural, frame) {
  const scale = baseScale(natural, frame) * zoom
  const maxX = Math.max(0, (natural.w * scale - frame) / 2)
  const maxY = Math.max(0, (natural.h * scale - frame) / 2)
  return {
    x: Math.min(maxX, Math.max(-maxX, pan.x)),
    y: Math.min(maxY, Math.max(-maxY, pan.y)),
  }
}

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

// The crop step between picking a file and it landing on a card: drag to
// recentre, pinch/wheel/the slider to zoom, with the frame itself as the
// preview -- what it shows is exactly what gets saved, at the same square
// every photo in the app is now stored as (see PHOTO_SIZE in photos.js).
export default function PhotoCropper({ file, width, height, round, onConfirm, onCancel, onError }) {
  const [url] = useState(() => URL.createObjectURL(file))
  const [ready, setReady] = useState(false)
  const [natural, setNatural] = useState({ w: 1, h: 1 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [frameSize, setFrameSize] = useState(1)

  const frameRef = useRef(null)
  const imgRef = useRef(null)
  const pointers = useRef(new Map())
  const dragStart = useRef(null)
  const pinchStart = useRef(null)

  useEffect(() => () => URL.revokeObjectURL(url), [url])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onCancel])

  function measureFrame() {
    if (frameRef.current) setFrameSize(frameRef.current.getBoundingClientRect().width)
  }

  // The frame is sized by CSS (min(320px, 76vw)), so re-measure on resize --
  // unfolding the Duo mid-crop, say. The next drag or zoom re-clamps pan
  // against the new size; nothing here needs to pre-empt that.
  useEffect(() => {
    window.addEventListener('resize', measureFrame)
    return () => window.removeEventListener('resize', measureFrame)
  }, [])

  function handleImageLoad() {
    measureFrame()
    setNatural({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight })
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setReady(true)
  }

  function applyZoom(nextZoom) {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom))
    setZoom(clamped)
    setPan((p) => clampPan(p, clamped, natural, frameSize))
  }

  function onPointerDown(event) {
    frameRef.current?.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 1) {
      dragStart.current = { x: event.clientX, y: event.clientY, pan }
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinchStart.current = { dist: distance(a, b), zoom }
      dragStart.current = null
    }
  }

  function onPointerMove(event) {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()]
      const ratio = distance(a, b) / (pinchStart.current.dist || 1)
      applyZoom(pinchStart.current.zoom * ratio)
    } else if (pointers.current.size === 1 && dragStart.current) {
      const dx = event.clientX - dragStart.current.x
      const dy = event.clientY - dragStart.current.y
      setPan(
        clampPan(
          { x: dragStart.current.pan.x + dx, y: dragStart.current.pan.y + dy },
          zoom,
          natural,
          frameSize,
        ),
      )
    }
  }

  function endPointer(event) {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size < 2) pinchStart.current = null
    if (pointers.current.size === 1) {
      const [only] = [...pointers.current.values()]
      dragStart.current = { x: only.x, y: only.y, pan }
    } else if (pointers.current.size === 0) {
      dragStart.current = null
    }
  }

  function onWheel(event) {
    event.preventDefault()
    applyZoom(zoom - event.deltaY * 0.0015)
  }

  function handleConfirm() {
    const frame = frameSize
    const scale = baseScale(natural, frame) * zoom
    const srcSize = frame / scale
    let srcX = natural.w / 2 - pan.x / scale - srcSize / 2
    let srcY = natural.h / 2 - pan.y / scale - srcSize / 2
    srcX = Math.max(0, Math.min(srcX, natural.w - srcSize))
    srcY = Math.max(0, Math.min(srcY, natural.h - srcSize))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas
      .getContext('2d')
      .drawImage(imgRef.current, srcX, srcY, srcSize, srcSize, 0, 0, width, height)
    onConfirm(canvas.toDataURL('image/jpeg', 0.82))
  }

  const scale = baseScale(natural, frameSize) * zoom
  const displayW = natural.w * scale
  const displayH = natural.h * scale

  return (
    <div className="cropper" role="dialog" aria-modal="true" aria-label={t('cropTitle')}>
      <h2 className="cropper__title">{t('cropTitle')}</h2>

      <div
        ref={frameRef}
        className={round ? 'cropper__frame cropper__frame--round' : 'cropper__frame'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onWheel={onWheel}
      >
        <img
          ref={imgRef}
          className="cropper__image"
          src={url}
          alt=""
          draggable={false}
          onLoad={handleImageLoad}
          onError={onError}
          style={
            ready
              ? {
                  width: `${displayW}px`,
                  height: `${displayH}px`,
                  transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px)`,
                }
              : { opacity: 0 }
          }
        />
      </div>

      <p className="cropper__hint">{t('cropHint')}</p>

      <div className="cropper__zoom">
        <span className="cropper__zoom-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="range"
          className="cropper__slider"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(event) => applyZoom(Number(event.target.value))}
          aria-label={t('cropZoomLabel')}
        />
      </div>

      <div className="cropper__actions">
        <button type="button" className="button" onClick={onCancel}>
          {t('cropCancel')}
        </button>
        <button type="button" className="button button--primary" onClick={handleConfirm}>
          {t('cropConfirm')}
        </button>
      </div>
    </div>
  )
}

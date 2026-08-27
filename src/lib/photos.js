// Artist photos are cropped and downscaled in the browser before they are
// stored, so a 4 MB camera roll picture becomes a ~50 KB card image.
//
// Photos live under one key per concert instead of inside the concerts blob:
// that way editing a date rewrites a few hundred bytes rather than every
// photo. This whole module is the seam to swap if we ever outgrow
// localStorage — IndexedDB would drop in behind the same four functions.
const PREFIX = 'concerts.photo.'

// Cropped to the aspect ratio of the card photo panel, at 2x for retina.
export const PHOTO_WIDTH = 640
export const PHOTO_HEIGHT = 420

// The avatar is square and small, and stored under its own reserved id.
export const PROFILE_ID = 'profile'
export const PROFILE_SIZE = 220

// Tried in order when storage is tight.
const QUALITIES = [0.78, 0.6, 0.45]

export function getPhoto(id) {
  try {
    return localStorage.getItem(PREFIX + id) || ''
  } catch {
    return ''
  }
}

export function removePhoto(id) {
  try {
    localStorage.removeItem(PREFIX + id)
  } catch {
    // ignore
  }
}

// Returns true when the photo landed, false when every quality blew the quota.
export async function storePhoto(id, dataUrl, options = {}) {
  if (!dataUrl) {
    removePhoto(id)
    return true
  }
  for (const quality of [null, ...QUALITIES.slice(1)]) {
    const candidate =
      quality === null ? dataUrl : await preparePhoto(dataUrl, { ...options, quality })
    try {
      localStorage.setItem(PREFIX + id, candidate)
      return true
    } catch {
      // Quota: fall through and try a smaller re-encode.
    }
  }
  removePhoto(id)
  return false
}

export function listPhotos(ids) {
  const out = {}
  for (const id of ids) {
    const photo = getPhoto(id)
    if (photo) out[id] = photo
  }
  return out
}

// Center-crops to the card aspect ratio the same way `object-fit: cover` would,
// then re-encodes as JPEG. Accepts a File from the picker or an existing
// data URL (used to shrink a photo that did not fit).
export async function preparePhoto(
  source,
  { quality = QUALITIES[0], width = PHOTO_WIDTH, height = PHOTO_HEIGHT } = {},
) {
  const image = await loadImage(source)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  const scale = Math.max(width / image.width, height / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
  return canvas.toDataURL('image/jpeg', quality)
}

async function loadImage(source) {
  // createImageBitmap honours EXIF orientation, so phone photos are not sideways.
  if (typeof source !== 'string' && globalThis.createImageBitmap) {
    try {
      return await createImageBitmap(source, { imageOrientation: 'from-image' })
    } catch {
      // Fall through to the <img> path.
    }
  }
  const url = typeof source === 'string' ? source : URL.createObjectURL(source)
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('could not decode image'))
      img.src = url
    })
  } finally {
    if (typeof source !== 'string') URL.revokeObjectURL(url)
  }
}

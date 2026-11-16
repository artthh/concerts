// Artist photos are cropped and downscaled in the browser before they are
// stored, so a 4 MB camera roll picture becomes a ~50 KB card image.
//
// Photos live in their own IndexedDB store, one record per concert, rather
// than inside the concerts blob or localStorage: localStorage caps out
// around 5 MB (about 60-65 photos), a ceiling this app's own users have hit.
// IndexedDB's limit is a share of free disk space -- normally gigabytes.
// Anything already stored under the old `concerts.photo.<id>` localStorage
// keys is moved over once, the first time this module runs after the
// upgrade (see migrateFromLocalStorage below).
const DB_NAME = 'concerts'
const STORE = 'photos'
const OLD_PREFIX = 'concerts.photo.'
const MIGRATION_FLAG = 'concerts.photosMigratedToIdb'

// Square, not the card panel's own aspect ratio: a photo is displayed at
// several different ratios across the app (the diagonal card strip, a
// square tile, the Home hero, the 4:5 share card), each cropping further
// via object-fit: cover. Square is the one shape that keeps every one of
// those a moderate crop instead of the tile being perfect and the others
// severe. The interactive cropper (PhotoCropper.jsx) is what lets a person
// choose which part of the photo that square actually shows.
export const PHOTO_SIZE = 640

// The avatar is square and small, and stored under its own reserved id.
export const PROFILE_ID = 'profile'
export const PROFILE_SIZE = 220

// Tried in order when storage is tight.
const QUALITIES = [0.78, 0.6, 0.45]

let dbPromise = null
function openDb() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error('IndexedDB unavailable'))
      return
    }
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

async function idbGet(id) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(id)
    request.onsuccess = () => resolve(request.result || '')
    request.onerror = () => reject(request.error)
  })
}

async function idbSet(id, value) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function idbDelete(id) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Runs once per browser: anything left from before the IndexedDB move gets
// copied over and cleared out of localStorage, which is the whole point --
// freeing the quota that was the problem in the first place. Every public
// function below awaits this first, so nothing can read or write photos
// while a migration might still be half-done. If it fails partway (a quota
// or IndexedDB error), the flag never gets set and the next call tries
// again rather than losing the rest of the photos silently.
let migratePromise = null
function migrateFromLocalStorage() {
  if (migratePromise) return migratePromise
  migratePromise = (async () => {
    try {
      if (localStorage.getItem(MIGRATION_FLAG)) return
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(OLD_PREFIX)) keys.push(key)
      }
      for (const key of keys) {
        const value = localStorage.getItem(key)
        if (value) await idbSet(key.slice(OLD_PREFIX.length), value)
        localStorage.removeItem(key)
      }
      localStorage.setItem(MIGRATION_FLAG, '1')
    } catch {
      // Best effort -- the flag stays unset, so this runs again next time.
    }
  })()
  return migratePromise
}

export async function getPhoto(id) {
  await migrateFromLocalStorage()
  try {
    return (await idbGet(id)) || ''
  } catch {
    return ''
  }
}

export async function removePhoto(id) {
  await migrateFromLocalStorage()
  try {
    await idbDelete(id)
  } catch {
    // ignore
  }
}

// Returns true when the photo landed, false when every quality blew the quota.
export async function storePhoto(id, dataUrl, options = {}) {
  await migrateFromLocalStorage()
  if (!dataUrl) {
    await removePhoto(id)
    return true
  }
  for (const quality of [null, ...QUALITIES.slice(1)]) {
    const candidate =
      quality === null ? dataUrl : await preparePhoto(dataUrl, { ...options, quality })
    try {
      await idbSet(id, candidate)
      return true
    } catch {
      // Quota: fall through and try a smaller re-encode.
    }
  }
  await removePhoto(id)
  return false
}

export async function listPhotos(ids) {
  await migrateFromLocalStorage()
  const out = {}
  for (const id of ids) {
    const photo = await getPhoto(id)
    if (photo) out[id] = photo
  }
  return out
}

// Center-crops to a square the same way `object-fit: cover` would, then
// re-encodes as JPEG. Only used to shrink an already-cropped photo at a
// lower quality when storage is tight -- re-centering a square on itself is
// a no-op crop, just a smaller re-encode. The interactive cropper picks the
// actual crop the first time; see PhotoCropper.jsx.
export async function preparePhoto(
  source,
  { quality = QUALITIES[0], width = PHOTO_SIZE, height = PHOTO_SIZE } = {},
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

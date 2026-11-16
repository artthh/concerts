// Backing store for shared-event links: a tiny, stateless-feeling layer on
// top of Vercel Blob. Each share gets a deterministic path from its id, so a
// lookup is a prefix match rather than needing an index of its own, and a
// TTL on the blobs themselves means an old share just stops existing -- no
// cron job, no separate "is this expired" bookkeeping to get out of sync.
import { list, put } from '@vercel/blob'

const TTL_DAYS = 30

const dataPath = (id) => `share/${id}/data.json`
const photoPath = (id) => `share/${id}/photo.jpg`

// Stores one shared event. A data: URL photo is split out into its own
// blob -- a plain https URL, which is what a link-preview crawler (and
// og:image) needs, and what lets the data.json blob stay small.
export async function storeShare(id, payload) {
  const toStore = { ...payload }

  const photo = typeof toStore.photo === 'string' ? toStore.photo : ''
  const match = /^data:([^;]+);base64,(.+)$/.exec(photo)
  if (match) {
    const [, contentType, base64] = match
    const blob = await put(photoPath(id), Buffer.from(base64, 'base64'), {
      access: 'public',
      addRandomSuffix: false,
      contentType: contentType || 'image/jpeg',
      ttlDays: TTL_DAYS,
    })
    toStore.photo = blob.url
  } else {
    delete toStore.photo
  }

  await put(dataPath(id), JSON.stringify(toStore), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    ttlDays: TTL_DAYS,
  })
}

// Finds the stored record for an id, or null if it never existed or its TTL
// has already deleted it -- the two look exactly the same from here, which
// is the point: an expired link just behaves like one that was never valid.
export async function loadShare(id) {
  const { blobs } = await list({ prefix: dataPath(id) })
  const found = blobs.find((b) => b.pathname === dataPath(id))
  if (!found) return null
  const response = await fetch(found.url)
  if (!response.ok) return null
  return response.json()
}

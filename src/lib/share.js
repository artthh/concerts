// Sharing one event as a link. The payload is the event itself, minus its id
// and timestamps (the recipient's copy gets its own, so editing or deleting
// it on either side never touches the other's).
//
// The link handed to navigator.share()/the clipboard is a short /s/<id> --
// a tiny server function (api/share.js, api/s/[id].js) stores the event and
// serves that id back a proper Open Graph preview, so Messages/WhatsApp show
// a real card (title, venue, photo) instead of a wall of link text. If that
// request fails for any reason -- offline, the server storage not set up --
// this falls back to the older link form, the whole payload encoded straight
// into the URL's hash, which needs no server at all to open.
import { normalizeEvent } from './events.js'
import { preparePhoto } from './photos.js'

const HASH_KEY = 'share' // legacy, fully self-contained link
const SHORT_HASH_KEY = 'shared' // short link's id, resolved via the server

// The photo already stored locally (640x640, quality 0.78) would make even
// the fallback link enormous, so it is shrunk further just for sharing --
// still recognisable, but reasonable to paste or hand to a share sheet.
const SHARE_PHOTO_SIZE = 320
const SHARE_PHOTO_QUALITY = 0.5

// Only matters for the fallback link below -- the short link never puts the
// photo in the URL at all. A pathological photo that barely compresses
// could still blow this up; past it, the fallback goes out without the
// photo rather than producing a link nothing can open.
const MAX_FALLBACK_URL_LENGTH = 300000

// Plain btoa() only handles Latin-1, so an emoji or an accented venue name
// breaks it; a URL also needs -_ and no padding, not the +/= a plain
// base64 string carries. This round-trips both.
function encodeBase64Url(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeBase64Url(encoded) {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function buildFallbackUrl(shareable) {
  const url = new URL(window.location.href)
  let encoded = encodeBase64Url(JSON.stringify(shareable))
  if (encoded.length > MAX_FALLBACK_URL_LENGTH && shareable.photo) {
    encoded = encodeBase64Url(JSON.stringify({ ...shareable, photo: '' }))
  }
  url.hash = `${HASH_KEY}=${encoded}`
  return url.toString()
}

export async function buildShareUrl(event) {
  const shareable = { ...event }
  delete shareable.id
  delete shareable.createdAt
  delete shareable.updatedAt

  if (shareable.photo) {
    try {
      shareable.photo = await preparePhoto(shareable.photo, {
        width: SHARE_PHOTO_SIZE,
        height: SHARE_PHOTO_SIZE,
        quality: SHARE_PHOTO_QUALITY,
      })
    } catch {
      shareable.photo = ''
    }
  }

  try {
    const response = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shareable),
    })
    if (!response.ok) throw new Error('share request failed')
    const { id } = await response.json()
    if (!id) throw new Error('no id returned')
    const url = new URL(window.location.href)
    url.hash = ''
    url.pathname = `/s/${id}`
    return url.toString()
  } catch {
    return buildFallbackUrl(shareable)
  }
}

// Reads a shared event out of the current URL, if there is one -- either the
// short #shared=<id> form (fetched from the server) or the older, fully
// self-contained #share=<payload> form from before short links existed.
// Clears the hash either way, so a stale link sitting in the address bar
// does not re-offer itself on every reload. Resolves to null for anything
// that fails to decode or fetch -- a mangled or expired link should just
// land on a normal, empty launch.
export async function takeSharedEvent() {
  const hash = window.location.hash.replace(/^#/, '')

  if (hash.startsWith(`${SHORT_HASH_KEY}=`)) {
    const id = decodeURIComponent(hash.slice(SHORT_HASH_KEY.length + 1))
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    try {
      const response = await fetch(`/api/share/${encodeURIComponent(id)}`)
      if (!response.ok) return null
      return normalizeEvent(await response.json())
    } catch {
      return null
    }
  }

  if (hash.startsWith(`${HASH_KEY}=`)) {
    const encoded = hash.slice(HASH_KEY.length + 1)
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    try {
      return normalizeEvent(JSON.parse(decodeBase64Url(encoded)))
    } catch {
      return null
    }
  }

  return null
}

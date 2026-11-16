// Sharing one event as a link, since there is no backend to hand it to
// instead. The payload is the event itself, minus its id and timestamps (the
// recipient's copy gets its own, so editing or deleting it on either side
// never touches the other's). It rides in the URL's hash, which the browser
// never sends to a server -- fitting for an app with none.
import { normalizeEvent } from './events.js'
import { preparePhoto } from './photos.js'

const HASH_KEY = 'share'

// The photo already stored locally (640x640, quality 0.78) would make the
// link itself enormous, so it is shrunk further just for the share -- still
// recognisable, but a link someone can actually paste or hand to a share
// sheet.
const SHARE_PHOTO_SIZE = 320
const SHARE_PHOTO_QUALITY = 0.5

// A pathological photo that barely compresses could still blow this up; past
// it, the share goes out without the photo rather than producing a link
// nothing can open.
const MAX_SHARE_URL_LENGTH = 300000

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

  const url = new URL(window.location.href)
  let encoded = encodeBase64Url(JSON.stringify(shareable))
  if (encoded.length > MAX_SHARE_URL_LENGTH && shareable.photo) {
    shareable.photo = ''
    encoded = encodeBase64Url(JSON.stringify(shareable))
  }
  url.hash = `${HASH_KEY}=${encoded}`
  return url.toString()
}

// Reads a shared event out of the current URL, if there is one. Clears the
// hash either way, so a stale share link sitting in the address bar does
// not re-offer itself on every reload. Returns null for anything that
// fails to decode rather than throwing -- a mangled link (a messaging app
// that truncated it, say) should just land on a normal, empty launch.
export function takeSharedEvent() {
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash.startsWith(`${HASH_KEY}=`)) return null
  const encoded = hash.slice(HASH_KEY.length + 1)
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
  try {
    return normalizeEvent(JSON.parse(decodeBase64Url(encoded)))
  } catch {
    return null
  }
}

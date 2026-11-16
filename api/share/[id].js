// What the client fetches after being redirected from /s/<id>: the full
// event, as JSON. The photo (stored as a plain https blob URL, for the sake
// of /s/<id>'s og:image) is re-inlined as a data: URL here, server-side --
// so the browser never needs to fetch it cross-origin itself, and the
// existing accept-a-shared-event code keeps working unchanged, exactly as
// if this had come from the older, fully self-contained link format.
import { loadShare } from '../_lib/shareStore.js'

export default async function handler(req, res) {
  const { id } = req.query
  if (!id || Array.isArray(id)) {
    res.status(400).json({ error: 'missing id' })
    return
  }

  let payload
  try {
    payload = await loadShare(id)
  } catch {
    res.status(500).json({ error: 'lookup failed' })
    return
  }

  if (!payload) {
    res.status(404).json({ error: 'not found' })
    return
  }

  if (typeof payload.photo === 'string' && payload.photo.startsWith('http')) {
    try {
      const photoResponse = await fetch(payload.photo)
      if (photoResponse.ok) {
        const contentType = photoResponse.headers.get('content-type') || 'image/jpeg'
        const bytes = Buffer.from(await photoResponse.arrayBuffer())
        payload.photo = `data:${contentType};base64,${bytes.toString('base64')}`
      } else {
        payload.photo = ''
      }
    } catch {
      payload.photo = ''
    }
  }

  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json(payload)
}

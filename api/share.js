// Creates a share: stores the event (see _lib/shareStore.js) under a fresh
// short id and hands that id back. The client then builds the actual link
// from it (/s/<id>) -- this endpoint only ever deals in ids and payloads.
import crypto from 'node:crypto'
import { storeShare } from './_lib/shareStore.js'

// Generous but bounded -- the client already keeps this far smaller (the
// photo alone is shrunk to a few KB before it ever gets here); this is just
// a backstop against something unexpected.
const MAX_BODY_BYTES = 2_000_000

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      res.status(400).json({ error: 'invalid json' })
      return
    }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ error: 'invalid payload' })
    return
  }
  if (JSON.stringify(body).length > MAX_BODY_BYTES) {
    res.status(413).json({ error: 'payload too large' })
    return
  }

  const id = crypto.randomBytes(6).toString('base64url')
  try {
    await storeShare(id, body)
  } catch {
    res.status(500).json({ error: 'could not store share' })
    return
  }

  res.status(200).json({ id })
}

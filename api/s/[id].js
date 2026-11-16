// The actual link a person sends: short, and -- unlike the app's own
// client-rendered pages -- fetchable by a link-preview crawler (iMessage,
// WhatsApp, ...), which never runs the page's JavaScript and so would
// otherwise see nothing but a blank shell. This returns plain HTML with the
// event's own title/venue/date/photo as Open Graph tags, then immediately
// sends a real browser on to the app itself to actually open the share.
import { loadShare } from '../_lib/shareStore.js'

function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  )
}

function formatEventDate(dateISO) {
  const parsed = Date.parse(String(dateISO) + 'T00:00:00')
  if (Number.isNaN(parsed)) return ''
  return new Date(parsed).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function handler(req, res) {
  const { id } = req.query

  let payload = null
  if (id && !Array.isArray(id)) {
    try {
      payload = await loadShare(id)
    } catch {
      payload = null
    }
  }

  const title = escapeHtml(
    payload ? `${payload.title || 'Shared event'}${payload.emoji ? ` ${payload.emoji}` : ''}` : 'Shared event',
  )
  const description = payload
    ? escapeHtml([payload.venue, formatEventDate(payload.date)].filter(Boolean).join(' · ') || 'Open in Countdown')
    : 'This link has expired.'
  const image = payload && typeof payload.photo === 'string' && payload.photo.startsWith('http')
    ? escapeHtml(payload.photo)
    : null
  const redirect = payload ? `/#shared=${encodeURIComponent(id)}` : '/'

  const head = [
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<title>${title} — Countdown</title>`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    image ? `<meta property="og:image" content="${image}" />` : '',
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    `<script>location.replace(${JSON.stringify(redirect)})</script>`,
  ]
    .filter(Boolean)
    .join('\n')

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).send(`<!doctype html>
<html lang="en">
<head>
${head}
</head>
<body>
<p><a href="${redirect}">Open in Countdown</a></p>
</body>
</html>`)
}

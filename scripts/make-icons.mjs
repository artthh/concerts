// Generates the PNG app icons from the same shapes as public/icon.svg.
// No image dependencies: we rasterize a handful of rounded rectangles and
// encode the result as PNG with node's zlib. Run with `npm run icons`.
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

// Geometry is authored on a 512x512 grid and scaled per output size.
const BARS = [
  { x: 112, y: 256, w: 40, h: 128 },
  { x: 176, y: 192, w: 40, h: 192 },
  { x: 240, y: 128, w: 40, h: 256 },
  { x: 304, y: 208, w: 40, h: 176 },
  { x: 368, y: 272, w: 40, h: 112 },
]
const BG_TOP = [0x1b, 0x10, 0x30]
const BG_BOTTOM = [0x07, 0x04, 0x0d]
const BAR_TOP = [0xf4, 0x72, 0xb6]
const BAR_BOTTOM = [0x7c, 0x3a, 0xed]

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))

// Signed distance to a rounded rect, used for antialiased coverage.
function roundedRectDistance(px, py, x, y, w, h, r) {
  const cx = Math.abs(px - (x + w / 2)) - (w / 2 - r)
  const cy = Math.abs(py - (y + h / 2)) - (h / 2 - r)
  const dx = Math.max(cx, 0)
  const dy = Math.max(cy, 0)
  return Math.min(Math.max(cx, cy), 0) + Math.sqrt(dx * dx + dy * dy) - r
}

const coverage = (d) => Math.min(1, Math.max(0, 0.5 - d))

function render(size, { squircle = true, inset = 0 } = {}) {
  const s = size / 512
  const radius = squircle ? 112 * s : 0
  const rgba = Buffer.alloc(size * size * 4)
  const scale = 1 - inset * 2

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const i = (py * size + px) * 4
      const t = py / (size - 1)

      let bg = mix(BG_TOP, BG_BOTTOM, t)
      let alpha = squircle
        ? coverage(roundedRectDistance(px + 0.5, py + 0.5, 0, 0, size, size, radius))
        : 1

      // Map the pixel back into the 512-grid the bars are authored on,
      // honouring the maskable safe-area inset.
      const gx = ((px + 0.5) / size - inset) / scale * 512
      const gy = ((py + 0.5) / size - inset) / scale * 512

      let barCoverage = 0
      for (const b of BARS) {
        const d = roundedRectDistance(gx, gy, b.x, b.y, b.w, b.h, b.w / 2) * s * scale
        barCoverage = Math.max(barCoverage, coverage(d))
      }

      if (barCoverage > 0) {
        const barColor = mix(BAR_TOP, BAR_BOTTOM, Math.min(1, Math.max(0, (gy - 128) / 256)))
        bg = mix(bg, barColor, barCoverage)
        alpha = Math.max(alpha, barCoverage)
      }

      rgba[i] = bg[0]
      rgba[i + 1] = bg[1]
      rgba[i + 2] = bg[2]
      rgba[i + 3] = Math.round(alpha * 255)
    }
  }
  return rgba
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // truecolour with alpha
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const OUTPUTS = [
  // iOS ignores transparency and squircles the icon itself, so ship it full-bleed.
  { file: 'apple-touch-icon.png', size: 180, options: { squircle: false } },
  { file: 'icon-192.png', size: 192, options: {} },
  { file: 'icon-512.png', size: 512, options: {} },
  // Android maskable icons get cropped: keep the artwork inside the safe area.
  { file: 'icon-maskable-512.png', size: 512, options: { squircle: false, inset: 0.1 } },
]

for (const { file, size, options } of OUTPUTS) {
  writeFileSync(join(PUBLIC_DIR, file), encodePng(size, render(size, options)))
  console.log(`wrote public/${file} (${size}x${size})`)
}

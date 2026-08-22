// Generates the PNG app icons: the microphone emoji on the same dark gradient
// as public/icon.svg.
//
//   npm run icons
//
// An emoji needs a real font renderer, so the glyph is drawn by a headless
// Chrome. Everything after that -- cropping and downscaling -- is done here
// with node's zlib, so the script still takes no npm dependency. It needs a
// Chrome or Chromium on the machine; set CHROME_PATH if yours is unusual.
//
// Three Chrome behaviours shape this, all learned the hard way after a 180px
// apple-touch-icon shipped with the artwork crammed into the top and the rest
// transparent:
//
//   1. The screenshot is exactly --window-size, but only the *viewport* area
//      gets painted, and the viewport is shorter than the window because it
//      excludes the browser's own chrome. So the window is sized until the
//      viewport is a square of the size we want, and the taller screenshot is
//      then cropped down to it here.
//   2. --window-size is clamped to a 500px minimum width, silently. Below that
//      the page is laid out squashed and the icon is wrong, so the viewport is
//      read back and asserted.
//   3. --force-device-scale-factor will not go below 0.5, so small icons cannot
//      be rendered directly. They are box-filtered down from the 512 render.
import { execFileSync } from 'node:child_process'
import { deflateSync, inflateSync } from 'node:zlib'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

const EMOJI = '🎤'
const GRADIENT = 'linear-gradient(135deg, #1b1030 0%, #07040d 100%)'
const RENDER = 512 // Chrome renders at this size; must stay >= MIN_WIDTH.
const MIN_WIDTH = 500 // Chrome's window-width floor.

const OUTPUTS = [
  // iOS ignores transparency and rounds the corners itself, so ship it square.
  { file: 'apple-touch-icon.png', size: 180, radius: 0, scale: 0.56 },
  { file: 'icon-192.png', size: 192, radius: 22, scale: 0.56 },
  { file: 'icon-512.png', size: 512, radius: 22, scale: 0.56 },
  // Android maskable icons get cropped, so keep the emoji well inside.
  { file: 'icon-maskable-512.png', size: 512, radius: 0, scale: 0.42 },
]

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].filter(Boolean)

const chrome = CANDIDATES.find((path) => existsSync(path))
if (!chrome) {
  console.error('No Chrome or Chromium found. Install one, or set CHROME_PATH to its binary.')
  process.exit(1)
}

// Sized in viewport units so the artwork fills whatever viewport Chrome hands
// back, which is the only region that gets painted.
const page = ({ radius, scale }) => `<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; background: transparent; }
  .icon {
    width: 100vw;
    height: 100vh;
    border-radius: ${radius}%;
    background: ${GRADIENT};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${scale * 100}vmin;
    line-height: 1;
  }
  /* The glyph's own box sits high; nudge it to the optical centre. */
  .glyph { transform: translateY(2%); }
</style>
<div class="icon"><span class="glyph">${EMOJI}</span></div>
<script>
  document.body.dataset.viewport = window.innerWidth + 'x' + window.innerHeight
</script>
`

const flags = (windowHeight) => [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--default-background-color=00000000',
  `--window-size=${RENDER},${windowHeight}`,
]

function viewportOf(windowHeight, html) {
  const dom = execFileSync(chrome, [...flags(windowHeight), '--dump-dom', `file://${html}`], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  const match = dom.match(/data-viewport="(\d+)x(\d+)"/)
  if (!match) throw new Error('could not read the viewport back from Chrome')
  return { width: Number(match[1]), height: Number(match[2]) }
}

// Behaviour 1: the chrome overhead is not a clean constant, so correct until
// the viewport is square instead of hardcoding an offset.
function windowHeightForSquareViewport(html) {
  let windowHeight = RENDER
  for (let attempt = 0; attempt < 8; attempt++) {
    const viewport = viewportOf(windowHeight, html)
    if (viewport.width !== RENDER) {
      // Behaviour 2.
      throw new Error(
        `Chrome clamped the window width to ${viewport.width} instead of ${RENDER}; ` +
          'the icon would be laid out in a squashed page.',
      )
    }
    if (viewport.height === RENDER) return windowHeight
    windowHeight += RENDER - viewport.height
  }
  throw new Error(`could not get a square ${RENDER}x${RENDER} viewport out of Chrome`)
}

/* PNG ------------------------------------------------------------------- */

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

// Decodes 8-bit RGB/RGBA PNGs, which is all Chrome writes here, into RGBA.
function decodePng(buffer) {
  const width = buffer.readUInt32BE(16)
  const height = buffer.readUInt32BE(20)
  const depth = buffer[24]
  const colorType = buffer[25]
  if (depth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`unsupported PNG: depth ${depth}, colour type ${colorType}`)
  }
  const channels = colorType === 6 ? 4 : 3

  const parts = []
  let offset = 8
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    if (type === 'IDAT') parts.push(buffer.subarray(offset + 8, offset + 8 + length))
    if (type === 'IEND') break
    offset += 12 + length
  }

  const raw = inflateSync(Buffer.concat(parts))
  const stride = width * channels
  const rgba = Buffer.alloc(width * height * 4)
  const line = Buffer.alloc(stride)
  const previous = Buffer.alloc(stride)

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    raw.copy(line, 0, y * (stride + 1) + 1, y * (stride + 1) + 1 + stride)
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? line[i - channels] : 0
      const b = previous[i]
      const c = i >= channels ? previous[i - channels] : 0
      switch (filter) {
        case 1:
          line[i] = (line[i] + a) & 0xff
          break
        case 2:
          line[i] = (line[i] + b) & 0xff
          break
        case 3:
          line[i] = (line[i] + ((a + b) >> 1)) & 0xff
          break
        case 4: {
          const p = a + b - c
          const pa = Math.abs(p - a)
          const pb = Math.abs(p - b)
          const pc = Math.abs(p - c)
          line[i] = (line[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff
          break
        }
        default:
          break
      }
    }
    for (let x = 0; x < width; x++) {
      const to = (y * width + x) * 4
      const from = x * channels
      rgba[to] = line[from]
      rgba[to + 1] = line[from + 1]
      rgba[to + 2] = line[from + 2]
      rgba[to + 3] = channels === 4 ? line[from + 3] : 255
    }
    line.copy(previous)
  }
  return { width, height, rgba }
}

function encodePng({ width, height, rgba }) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const raw = Buffer.alloc(height * (width * 4 + 1))
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// Behaviour 1: keep the painted square off the top of the taller screenshot.
function cropTopSquare(image, side) {
  if (image.width < side || image.height < side) {
    throw new Error(`screenshot ${image.width}x${image.height} is smaller than ${side}`)
  }
  const rgba = Buffer.alloc(side * side * 4)
  for (let y = 0; y < side; y++) {
    image.rgba.copy(rgba, y * side * 4, y * image.width * 4, y * image.width * 4 + side * 4)
  }
  return { width: side, height: side, rgba }
}

// Behaviour 3: average each destination pixel over its source box. Good enough
// for a downscale from 512, and it keeps the edges of the glyph smooth.
function downscale(image, side) {
  if (side === image.width) return image
  const rgba = Buffer.alloc(side * side * 4)
  const ratio = image.width / side
  for (let y = 0; y < side; y++) {
    const y0 = Math.floor(y * ratio)
    const y1 = Math.min(image.height, Math.ceil((y + 1) * ratio))
    for (let x = 0; x < side; x++) {
      const x0 = Math.floor(x * ratio)
      const x1 = Math.min(image.width, Math.ceil((x + 1) * ratio))
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      let n = 0
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * image.width + sx) * 4
          // Weight colour by alpha so transparent pixels do not wash the edges.
          const alpha = image.rgba[i + 3]
          r += image.rgba[i] * alpha
          g += image.rgba[i + 1] * alpha
          b += image.rgba[i + 2] * alpha
          a += alpha
          n++
        }
      }
      const to = (y * side + x) * 4
      rgba[to] = a ? Math.round(r / a) : 0
      rgba[to + 1] = a ? Math.round(g / a) : 0
      rgba[to + 2] = a ? Math.round(b / a) : 0
      rgba[to + 3] = Math.round(a / n)
    }
  }
  return { width: side, height: side, rgba }
}

/* Run ------------------------------------------------------------------- */

if (RENDER < MIN_WIDTH) {
  throw new Error(`RENDER must stay at or above ${MIN_WIDTH}: Chrome clamps the window width.`)
}

const work = mkdtempSync(join(tmpdir(), 'encore-icons-'))
try {
  for (const output of OUTPUTS) {
    const html = join(work, `${output.file}.html`)
    writeFileSync(html, page(output))

    const windowHeight = windowHeightForSquareViewport(html)
    const shot = join(work, `${output.file}.raw.png`)
    execFileSync(chrome, [...flags(windowHeight), `--screenshot=${shot}`, `file://${html}`], {
      stdio: 'ignore',
    })

    const square = cropTopSquare(decodePng(readFileSync(shot)), RENDER)
    const final = downscale(square, output.size)

    // Nothing should be transparent in the middle of a finished icon: that is
    // what the original breakage looked like.
    const centre = ((final.height >> 1) * final.width + (final.width >> 1)) * 4
    const bottom = ((final.height - 1) * final.width + (final.width >> 1)) * 4
    if (final.rgba[centre + 3] === 0 || final.rgba[bottom + 3] === 0) {
      throw new Error(`${output.file}: came out transparent where it should be painted`)
    }

    writeFileSync(join(PUBLIC_DIR, output.file), encodePng(final))
    console.log(`wrote public/${output.file} (${final.width}x${final.height})`)
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}

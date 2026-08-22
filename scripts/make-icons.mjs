// Generates the PNG app icons: the microphone emoji on the same dark gradient
// as public/icon.svg.
//
// An emoji needs a real font renderer, so this shells out to a headless Chrome
// and uses its --screenshot flag. No npm dependency; it just needs a Chrome or
// Chromium on the machine. Point CHROME_PATH at one if it is somewhere unusual.
//
//   npm run icons
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

const EMOJI = '🎤'
const GRADIENT = 'linear-gradient(135deg, #1b1030 0%, #07040d 100%)'

const OUTPUTS = [
  // iOS ignores transparency and rounds the corners itself, so ship it square.
  { file: 'apple-touch-icon.png', size: 180, radius: 0, scale: 0.52 },
  { file: 'icon-192.png', size: 192, radius: 0.22, scale: 0.52 },
  { file: 'icon-512.png', size: 512, radius: 0.22, scale: 0.52 },
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
  console.error(
    'No Chrome or Chromium found. Install one, or set CHROME_PATH to its binary.',
  )
  process.exit(1)
}

const page = ({ size, radius, scale }) => `<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; background: transparent; }
  .icon {
    width: ${size}px;
    height: ${size}px;
    border-radius: ${Math.round(size * radius)}px;
    background: ${GRADIENT};
    display: flex;
    align-items: center;
    justify-content: center;
    /* The glyph's own box sits high; nudge it back to the optical centre. */
    font-size: ${Math.round(size * scale)}px;
    line-height: 1;
  }
  .glyph { transform: translateY(2%); }
</style>
<div class="icon"><span class="glyph">${EMOJI}</span></div>
`

const work = mkdtempSync(join(tmpdir(), 'encore-icons-'))
try {
  for (const output of OUTPUTS) {
    const html = join(work, `${output.file}.html`)
    writeFileSync(html, page(output))
    execFileSync(
      chrome,
      [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        '--default-background-color=00000000',
        `--window-size=${output.size},${output.size}`,
        `--screenshot=${join(PUBLIC_DIR, output.file)}`,
        `file://${html}`,
      ],
      { stdio: 'ignore' },
    )
    console.log(`wrote public/${output.file} (${output.size}x${output.size})`)
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}

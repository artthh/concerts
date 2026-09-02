// Everything lives in localStorage: the app is offline-first and has no backend.
// Keep every key behind this module so a future sync layer has one seam to replace.
const PREFIX = 'concerts.'

export const KEYS = {
  concerts: PREFIX + 'items',
  theme: PREFIX + 'theme',
  kind: PREFIX + 'kind',
}

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    // Private browsing, quota errors, or corrupted JSON: fall back silently.
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export const BACKUP_VERSION = 1

export function exportBackup(concerts) {
  return {
    app: 'countdown',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    concerts,
  }
}

// Accepts a full backup envelope or a bare array of concerts.
export function readBackup(parsed) {
  if (Array.isArray(parsed)) return parsed
  if (parsed && Array.isArray(parsed.concerts)) return parsed.concerts
  return null
}

import { useRef } from 'react'
import { exportBackup, readBackup } from '../lib/storage.js'

// Export/import of the whole collection. Shared by History (compact, so a
// restore is reachable right where the records are) and Settings (full width,
// where the destructive replace also lives).
export default function BackupPanel({
  concerts,
  t,
  onImport,
  onToast,
  compact = false,
  allowReplace = false,
}) {
  const fileInput = useRef(null)
  const importMode = useRef('merge')

  function download() {
    const blob = new Blob([JSON.stringify(exportBackup(concerts), null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `encore-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function pickFile(mode) {
    importMode.current = mode
    fileInput.current?.click()
  }

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const imported = readBackup(JSON.parse(await file.text()))
      if (!imported) throw new Error('unrecognized backup')
      const added = await onImport(imported, importMode.current)
      onToast(t('importDone', { n: added }))
    } catch {
      onToast(t('importFailed'))
    }
  }

  const buttonClass = compact ? 'chip-button' : 'button'

  return (
    <div className={compact ? 'backup backup--compact' : 'backup'}>
      <button
        type="button"
        className={compact ? buttonClass : 'button button--primary'}
        onClick={download}
        disabled={concerts.length === 0}
      >
        {compact ? t('exportFile') : t('exportBackup')}
      </button>
      <button type="button" className={buttonClass} onClick={() => pickFile('merge')}>
        {compact ? t('importFile') : t('importMerge')}
      </button>
      {allowReplace && (
        <button
          type="button"
          className="button button--danger"
          onClick={() => pickFile('replace')}
        >
          {t('importReplace')}
        </button>
      )}
      <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={handleFile} />
    </div>
  )
}

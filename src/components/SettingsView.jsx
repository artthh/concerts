import { useRef } from 'react'
import { exportBackup, readBackup } from '../lib/storage.js'

export default function SettingsView({ concerts, t, lang, onLang, isDark, onTheme, onImport, onToast }) {
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
      const added = onImport(imported, importMode.current)
      onToast(t('importDone', { n: added }))
    } catch {
      onToast(t('importFailed'))
    }
  }

  return (
    <>
      <section className="section">
        <h2 className="section__title">{t('theme')}</h2>
        <button type="button" className="button" onClick={onTheme}>
          {isDark ? t('dark') : t('light')}
        </button>
      </section>

      <section className="section">
        <h2 className="section__title">{t('language')}</h2>
        <button type="button" className="button" onClick={onLang}>
          {lang === 'es' ? 'Español' : 'English'}
        </button>
      </section>

      <section className="section">
        <h2 className="section__title">{t('data')}</h2>
        <div className="card">
          <button type="button" className="button button--primary" onClick={download}>
            {t('exportBackup')}
          </button>
          <div className="modal__actions">
            <button type="button" className="button" onClick={() => pickFile('merge')}>
              {t('importMerge')}
            </button>
            <button type="button" className="button button--danger" onClick={() => pickFile('replace')}>
              {t('importReplace')}
            </button>
          </div>
          <p className="field__hint">{t('storageNote')}</p>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={handleFile}
          />
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">{t('installTitle')}</h2>
        <div className="card">
          <p className="field__hint" style={{ marginTop: 0 }}>
            {t('installBody')}
          </p>
        </div>
      </section>
    </>
  )
}

import BackupPanel from './BackupPanel.jsx'

export default function SettingsView({ events, t, lang, onLang, isDark, onTheme, onImport, onToast }) {
  return (
    <>
      <section className="section section--tight">
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
          <BackupPanel
            events={events}
            t={t}
            onImport={onImport}
            onToast={onToast}
            allowReplace
          />
          <p className="field__hint">{t('storageNote')}</p>
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

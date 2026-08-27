import { PROFILE_SIZE } from '../lib/photos.js'
import { t } from '../lib/i18n.js'
import BackupPanel from './BackupPanel.jsx'
import PhotoPicker from './PhotoPicker.jsx'

export default function SettingsView({
  events,
  isDark,
  onTheme,
  profilePhoto,
  onProfilePhoto,
  onImport,
  onToast,
}) {
  return (
    <>
      <section className="section section--tight">
        <h2 className="section__title">{t('profile')}</h2>
        <PhotoPicker
          value={profilePhoto}
          placeholder="🙂"
          width={PROFILE_SIZE}
          height={PROFILE_SIZE}
          round
          onChange={onProfilePhoto}
          onError={onToast}
        />
      </section>

      <section className="section">
        <h2 className="section__title">{t('theme')}</h2>
        <button type="button" className="button" onClick={onTheme}>
          {isDark ? t('dark') : t('light')}
        </button>
      </section>

      <section className="section">
        <h2 className="section__title">{t('data')}</h2>
        <div className="card">
          <BackupPanel
            events={events}
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

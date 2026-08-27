import { t } from '../lib/i18n.js'
import { GearIcon, PersonIcon } from './Icons.jsx'

// The title row: whatever heading the view wants on the left, settings and the
// profile photo on the right.
export default function PageHeader({ children, profilePhoto, onSettings }) {
  return (
    <div className="page-header">
      <div className="page-header__title">{children}</div>
      <div className="page-header__actions">
        <button
          type="button"
          className="icon-button"
          onClick={onSettings}
          aria-label={t('tabSettings')}
        >
          <GearIcon />
        </button>
        <button type="button" className="avatar" onClick={onSettings} aria-label={t('profile')}>
          {profilePhoto ? <img src={profilePhoto} alt="" /> : <PersonIcon />}
        </button>
      </div>
    </div>
  )
}

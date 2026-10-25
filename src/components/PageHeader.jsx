import { t } from '../lib/i18n.js'
import { GearIcon, PersonIcon } from './Icons.jsx'

// The title row: whatever heading the view wants on the left, settings and the
// profile photo on the right. `hideActions` drops that right side when the
// side rail is showing instead -- it already carries both at its foot, and
// rendering them twice is exactly the duplicate-controls bug Journey hit
// when it first did this.
export default function PageHeader({ children, profilePhoto, onSettings, hideActions }) {
  return (
    <div className="page-header">
      <div className="page-header__title">{children}</div>
      {!hideActions && (
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
      )}
    </div>
  )
}

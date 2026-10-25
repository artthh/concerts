import { t } from '../lib/i18n.js'
import { EventsIcon, GearIcon, HistoryIcon, HomeIcon, PersonIcon } from './Icons.jsx'

const SECTIONS = [
  { id: 'home', label: 'navHome', Icon: HomeIcon },
  { id: 'events', label: 'navEvents', Icon: EventsIcon },
  { id: 'history', label: 'navHistory', Icon: HistoryIcon },
]

// The bottom bar's replacement once there is room down the side instead --
// same three tabs and the same selected state, just vertical. Settings and
// the profile photo ride its foot, since PageHeader stops carrying them
// while the rail is up (otherwise both would render, which is exactly the
// duplicate-logo bug Journey hit first).
export default function SideRail({ section, onSection, wide, profilePhoto, onSettings }) {
  return (
    <nav className={wide ? 'rail rail--wide' : 'rail'} aria-label={t('appName')}>
      <span className="icon-button rail__mark" aria-hidden="true">
        ⏳
      </span>

      <div className="rail__tabs" role="tablist">
        {SECTIONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={section === id}
            className="rail__tab"
            onClick={() => onSection(id)}
          >
            <Icon active={section === id} />
            {wide && <span className="rail__label">{t(label)}</span>}
          </button>
        ))}
      </div>

      <div className="rail__spacer" />

      <div className="rail__foot">
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
    </nav>
  )
}

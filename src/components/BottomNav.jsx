import { t } from '../lib/i18n.js'
import { EventsIcon, HistoryIcon, HomeIcon } from './Icons.jsx'

const SECTIONS = [
  { id: 'home', label: 'navHome', Icon: HomeIcon },
  { id: 'events', label: 'navEvents', Icon: EventsIcon },
  { id: 'history', label: 'navHistory', Icon: HistoryIcon },
]

// A floating translucent bar rather than a full-width one, so the content
// scrolls visibly underneath it.
export default function BottomNav({ section, onSection }) {
  return (
    <nav className="bottomnav">
      <div className="bottomnav__bar" role="tablist">
        {SECTIONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={section === id}
            className="bottomnav__tab"
            onClick={() => onSection(id)}
          >
            <Icon active={section === id} />
            <span className="bottomnav__label">{t(label)}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

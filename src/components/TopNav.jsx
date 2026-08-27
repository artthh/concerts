import { t } from '../lib/i18n.js'

const SECTIONS = [
  { id: 'home', label: 'navHome' },
  { id: 'events', label: 'navEvents' },
  { id: 'history', label: 'navHistory' },
]

export default function TopNav({ section, onSection, onAdd, onSettings }) {
  return (
    <header className="topnav">
      {/* The mic is also the way into settings — the design has no gear. */}
      <button
        type="button"
        className="topnav__mark"
        onClick={onSettings}
        aria-label={t('tabSettings')}
      >
        🎤
      </button>

      <nav className="topnav__pills">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="pill"
            aria-current={section === item.id ? 'page' : undefined}
            onClick={() => onSection(item.id)}
          >
            <span className="pill__bar" aria-hidden="true" />
            {t(item.label)}
          </button>
        ))}
      </nav>

      <button type="button" className="topnav__add" onClick={onAdd} aria-label={t('add')}>
        +
      </button>
    </header>
  )
}

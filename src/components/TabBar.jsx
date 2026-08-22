const TABS = [
  { id: 'home', icon: '🎟', label: 'tabHome' },
  { id: 'history', icon: '🎸', label: 'tabHistory' },
  { id: 'stats', icon: '📊', label: 'tabStats' },
  { id: 'settings', icon: '⚙', label: 'tabSettings' },
]

export default function TabBar({ tab, onTab, t }) {
  return (
    <nav className="tabbar" role="tablist">
      <div className="tabbar__inner">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className="tabbar__tab"
            onClick={() => onTab(item.id)}
          >
            <span className="tabbar__icon" aria-hidden="true">
              {item.icon}
            </span>
            {t(item.label)}
          </button>
        ))}
      </div>
    </nav>
  )
}

export default function Header({ t, lang, onToggleLang, isDark, onToggleTheme, query, onQuery, showSearch }) {
  return (
    <header className="header">
      <div className="header__row">
        <img className="header__mark" src="/icon.svg" alt="" />
        <div>
          <h1 className="header__title">{t('appName')}</h1>
          <div className="header__tagline">{t('tagline')}</div>
        </div>
        <div className="header__spacer" />
        <button type="button" className="chip-button" onClick={onToggleTheme} aria-label={t('theme')}>
          {isDark ? '☀' : '☾'}
        </button>
        <button type="button" className="chip-button" onClick={onToggleLang} aria-label={t('language')}>
          {lang === 'es' ? 'EN' : 'ES'}
        </button>
      </div>
      {showSearch && (
        <input
          className="search"
          type="search"
          value={query}
          placeholder={t('search')}
          onChange={(event) => onQuery(event.target.value)}
        />
      )}
    </header>
  )
}

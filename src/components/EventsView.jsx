import { useState } from 'react'
import { KINDS, sortByDate } from '../lib/events.js'
import { t } from '../lib/i18n.js'
import EventCard from './EventCard.jsx'
import PageHeader from './PageHeader.jsx'

// The page title doubles as the category switcher: tapping "Concerts" opens
// the three categories right where the heading is.
export default function EventsView({ events, kind, onKind, counts, profilePhoto, onSettings, onOpen }) {
  const [open, setOpen] = useState(false)
  const sorted = sortByDate(events, 'asc')

  function pick(next) {
    onKind(next)
    setOpen(false)
  }

  return (
    <>
      <PageHeader profilePhoto={profilePhoto} onSettings={onSettings}>
      <div className="category">
        <button
          type="button"
          className="page-title category__button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {t(`kindPlural_${kind}`)}
          <span className={open ? 'category__chevron category__chevron--open' : 'category__chevron'} aria-hidden="true">
            ▾
          </span>
        </button>

        {open && (
          <div className="category__menu" role="menu">
            {KINDS.map((option) => (
              <button
                key={option}
                type="button"
                role="menuitem"
                className="category__option"
                aria-current={option === kind ? 'true' : undefined}
                onClick={() => pick(option)}
              >
                <span className="category__icon" aria-hidden="true">
                  {t(`kindIcon_${option}`)}
                </span>
                {t(`kindPlural_${option}`)}
                <span className="category__count">{counts[option] || 0}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      </PageHeader>

      {sorted.length === 0 ? (
        <p className="empty">{t(`emptyKind_${kind}`)}</p>
      ) : (
        <div className="show-list">
          {sorted.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              side={index % 2 === 0 ? 'left' : 'right'}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </>
  )
}

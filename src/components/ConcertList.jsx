import ConcertCard from './ConcertCard.jsx'

export default function ConcertList({ concerts, lang, t, onOpen, emptyMessage, showCountdown }) {
  if (concerts.length === 0) {
    // No message means the caller is already showing something (e.g. the hero).
    return emptyMessage ? <p className="empty">{emptyMessage}</p> : null
  }
  return (
    <div className="concert-list">
      {concerts.map((concert) => (
        <ConcertCard
          key={concert.id}
          concert={concert}
          lang={lang}
          t={t}
          onOpen={onOpen}
          showCountdown={showCountdown}
        />
      ))}
    </div>
  )
}

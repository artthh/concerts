export default function Stars({ value }) {
  if (!value) return null
  return (
    <span className="stars" aria-label={`${value}/5`}>
      {'★'.repeat(value)}
      {'☆'.repeat(5 - value)}
    </span>
  )
}

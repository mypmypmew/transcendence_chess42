export default function Avatar({ avatar, name, className = '', ...props }) {
  const fallback = name?.trim()?.[0]?.toUpperCase() ?? '?'

  return (
    <div
      className={`cm-avatar-photo ${className}`.trim()}
      {...props}
    >
      {avatar ? (
        <img className="cm-avatar-image" src={avatar} alt={name ?? ''} />
      ) : (
        fallback
      )}
    </div>
  )
}
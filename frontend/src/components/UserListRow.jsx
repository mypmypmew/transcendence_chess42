import Avatar from './Avatar.jsx'
import PresenceStatus from './PresenceStatus.jsx'
import {
  Icon,
  ListRow,
} from './ui.jsx'

function UserListRow({
  actions,
  avatar,
  className = '',
  meta,
  name,
  onClick,
  onKeyDown,
  showPresence = false,
  userId,
  ...props
}) {
  const isInteractive = typeof onClick === 'function'
  const shouldRenderButton = isInteractive && !actions

  return (
    <ListRow
      as={shouldRenderButton ? 'button' : 'article'}
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={isInteractive && !shouldRenderButton ? 'button' : undefined}
      tabIndex={isInteractive && !shouldRenderButton ? 0 : undefined}
      type={shouldRenderButton ? 'button' : undefined}
      {...props}
    >
      <Avatar avatar={avatar} name={name} className="avatar avatar-md" />

      <div className="min-w-0">
        <p className="text-primary truncate">{name}</p>
        <div className="flex items-center gap-2">
          <Icon className="text-accent" name="trophy" />
          <span className="text-muted">{meta}</span>
        </div>
        {showPresence && <PresenceStatus userId={userId} />}
      </div>

      {actions}
    </ListRow>
  )
}

export default UserListRow

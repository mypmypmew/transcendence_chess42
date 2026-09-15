import { usePresence } from '../context/PresenceContext.jsx'
import { StatusDot } from './ui.jsx'

const STATUS_LABELS = {
  online: 'Online',
  offline: 'Offline',
  unavailable: 'Status unavailable',
}

export default function PresenceStatus({ userId }) {
  const { getStatus } = usePresence()
  const status = getStatus(userId)

  return (
    <span className="flex items-center gap-2">
      <StatusDot status={status} />
      <span className="text-muted">{STATUS_LABELS[status]}</span>
    </span>
  )
}
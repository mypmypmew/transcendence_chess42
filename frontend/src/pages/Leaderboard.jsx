import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import './App.css'
const players = [
  { id: 1, nickname: 'Serhii', avatar: 'S', games: 42, rating: 1840 },
  { id: 2, nickname: 'Taulant', avatar: 'T', games: 38, rating: 1765 },
  { id: 3, nickname: 'Tatiana', avatar: 'T', games: 31, rating: 1690 },
  { id: 4, nickname: 'Alima', avatar: 'A', games: 27, rating: 1580 },
]
function Leaderboard({ onClose, onOpenProfile }) {
  const navigate = useNavigate()
  // TODO: Sorting and top-10 limiting are handled on the frontend while using mock data. This can be moved to the backend/API once real data is connected.
  const topPlayers = [...players]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10)
  const hasPlayers = topPlayers.length > 0
  const handleClose = () => {
    if (onClose) {
      onClose()
      return
    }
    navigate(-1)
  }
  const handleProfileOpen = (player) => {
    if (onOpenProfile) {
      onOpenProfile(player)
    }
  }
  return (
    <AppLayout eyebrow="Leaderboard Screen" title="Climb the rankings">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="leaderboard-title">
        <section className="cm-panel" aria-label="Leaderboard modal">
          <div className="cm-panel-header">
            <h2 className="cm-section-title" id="leaderboard-title">Leaderboard</h2>
            <button className="btn btn-ghost btn-sm" type="button" aria-label="Close leaderboard" onClick={handleClose}>Close</button>
          </div>
          <div className="cm-panel-body">
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
export default Leaderboard

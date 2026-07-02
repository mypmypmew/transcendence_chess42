import { useMemo, useState } from 'react'

import UserProfileModal from './UserProfileModal.jsx'
import './Modal.css'
const players = [
  { avatar: null, nickname: 'Serhii', rating: 1812, games: 200, isFriend: true },
  { avatar: null, nickname: 'Taulant', rating: 1694, games: 150, isFriend: true },
  { avatar: null, nickname: 'Tatiana', rating: 1740, games: 178, isFriend: true },
  { avatar: null, nickname: 'Alima', rating: 1658, games: 132, isFriend: true },
  { avatar: null, nickname: 'Mira', rating: 1775, games: 98, isFriend: false },
  { avatar: null, nickname: 'Niko', rating: 1796, games: 88, isFriend: false },
  { avatar: null, nickname: 'Elena', rating: 1726, games: 76, isFriend: false },
  { avatar: null, nickname: 'Arman', rating: 1688, games: 64, isFriend: false },
  { avatar: null, nickname: 'Lina', rating: 1632, games: 52, isFriend: false },
  { avatar: null, nickname: 'David', rating: 1590, games: 44, isFriend: false },
  { avatar: null, nickname: 'Sofia', rating: 1768, games: 39, isFriend: false },
  /* Optional filters for discussion */
  /*{ rank: 11, avatar: null, nickname: 'Sofia', rating: 1768, games: 39, wins: 19, winRate: '49%' },*/
]
function LeaderboardModal({ onClose }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const topPlayers = useMemo(() => {
    return [...players]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)
      .map((player, index) => ({ ...player, rank: index + 1 }))
  }, [])
  const hasPlayers = topPlayers.length > 0
  return (
    <div className="cm-modal" role="dialog" aria-modal="true" aria-labelledby="leaderboard-title">
      <button className="cm-modal__backdrop" type="button" aria-label="Close leaderboard modal" onClick={onClose} />
      <div className="cm-panel cm-modal__content">
        <div className="cm-panel-header">
          <div>
            <h2 className="cm-section-title" id="leaderboard-title">Leaderboard</h2>
            <p className="cm-muted">Top 10 players sorted by rating</p>
          </div>
          <div className="cm-modal__header-actions">
            <div className="cm-tabs" role="tablist" aria-label="Leaderboard filters">
              {/* Optional filters for discussion */}
              <button className="cm-tab active" type="button">Global</button>
              {/* <button className="cm-tab" type="button">Friends</button>
              <button className="cm-tab" type="button">Weekly</button>
              <button className="cm-tab" type="button">Monthly</button> */}
            </div>
            <button className="btn btn-ghost btn-icon" type="button" aria-label="Close leaderboard modal" onClick={onClose}>
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="cm-panel-body">
          {!hasPlayers && (
            <div className="empty-state">
              <i className="ti ti-trophy" aria-hidden="true" />
              <p className="text-primary">No players yet</p>
              <span className="text-muted">No games have been played yet.</span>
            </div>
          )}
          {hasPlayers && (
            <table className="cm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Games</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {topPlayers.map((player) => (
                  <tr key={player.nickname}>
                    <td>{player.rank}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-md cm-avatar-photo">
                          {player.avatar ? <img className="cm-avatar-image" src={player.avatar} alt="" /> : player.nickname[0]}
                        </div>
                        <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSelectedPlayer(player)}>
                          {player.nickname}
                        </button>
                      </div>
                    </td>
                    <td>{player.games}</td>
                    <td>{player.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {selectedPlayer && (
        <UserProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  )
}
export default LeaderboardModal

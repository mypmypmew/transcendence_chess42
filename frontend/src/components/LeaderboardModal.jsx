import { useMemo, useState } from 'react'
import './Modal.css'
const players = [
  { avatar: null, nickname: 'Serhii', rating: 2864, games: 200 },
  { avatar: null, nickname: 'Taulant', rating: 2802, games: 150 },
  { avatar: null, nickname: 'Tatiana', rating: 2750, games: 178 },
  { avatar: null, nickname: 'Alima', rating: 2701, games: 132 },
  { avatar: null, nickname: 'Mira', rating: 2410, games: 98 },
  { avatar: null, nickname: 'Niko', rating: 2284, games: 88 },
  { avatar: null, nickname: 'Elena', rating: 2180, games: 76 },
  { avatar: null, nickname: 'Arman', rating: 2075, games: 64 },
  { avatar: null, nickname: 'Lina', rating: 1960, games: 52 },
  { avatar: null, nickname: 'David', rating: 1842, games: 44 },
  { avatar: null, nickname: 'Sofia', rating: 1768, games: 39 },
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
        <div className="cm-modal cm-modal--nested" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
          <button className="cm-modal__backdrop" type="button" aria-label="Close profile modal" onClick={() => setSelectedPlayer(null)} />
          <div className="cm-panel cm-modal__content cm-modal__content--sm">
            <div className="cm-panel-header">
              <div className="flex items-center gap-3">
                <div className="avatar avatar-md cm-avatar-photo">
                  {selectedPlayer.avatar ? <img className="cm-avatar-image" src={selectedPlayer.avatar} alt="" /> : selectedPlayer.nickname[0]}
                </div>
                <div>
                  <h2 className="cm-section-title" id="profile-modal-title">{selectedPlayer.nickname}</h2>
                  <p className="cm-muted">Profile modal will be implemented here</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" type="button" aria-label="Close profile modal" onClick={() => setSelectedPlayer(null)}>
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>
            <div className="cm-panel-body">
              <div className="cm-list">
                <div className="cm-list-row">
                  <span className="text-muted">Rating</span>
                  <strong className="text-primary">{selectedPlayer.rating}</strong>
                </div>
                <div className="cm-list-row">
                  <span className="text-muted">Games</span>
                  <strong className="text-primary">{selectedPlayer.games}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default LeaderboardModal

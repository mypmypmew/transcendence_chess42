import { Link } from 'react-router-dom'

function getMockMatchHistory(profileOwner) {
  // TODO: Replace the mock with backend match history.
  // This keeps modal mock data aligned with Profile.jsx, but from the selected player's perspective.
  const profilePageMatches = {
    Serhii: [
      { id: 1, white: 'DemoPlayer', black: profileOwner, winner: 'DemoPlayer', moves: 42 },
    ],
    Taulant: [
      { id: 1, white: 'DemoPlayer', black: profileOwner, winner: profileOwner, moves: 35 },
    ],
    Tatiana: [
      { id: 1, white: 'DemoPlayer', black: profileOwner, winner: null, moves: 58 },
    ],
  }

  const profileMatches = profilePageMatches[profileOwner] || []
  const fallbackMatches = profileMatches.length > 0
    ? []
    : [{ id: 1, white: profileOwner, black: 'Serhii', winner: 'Serhii', moves: 28 }]

  return [
    ...profileMatches,
    ...fallbackMatches,
    { id: 2, white: profileOwner, black: 'Lina', winner: profileOwner, moves: 41 },
    { id: 3, white: profileOwner, black: 'Mira', winner: null, moves: 36 },
  ]
}

function getMatchResult(match, profileOwner) {
  if (!match.winner) {
    return 'Draw'
  }

  return match.winner === profileOwner ? 'Win' : 'Loss'
}

function getResultBadgeClass(result) {
  if (result === 'Win') {
    return 'badge badge-win'
  }

  if (result === 'Loss') {
    return 'badge badge-loss'
  }

  return 'badge badge-draw'
}

function getOpponent(match, profileOwner) {
  return match.white === profileOwner ? match.black : match.white
}

function UserProfileModal({ player, onClose }) {
  const matchHistory = getMockMatchHistory(player.nickname)

  return (
    <div className="cm-modal cm-modal--nested" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
      <button className="cm-modal__backdrop" type="button" aria-label="Close profile modal" onClick={onClose} />
      <div className="cm-panel cm-modal__content cm-modal__content--sm">
        <div className="cm-panel-header">
          <div className="flex items-center gap-3">
            <div className="avatar avatar-md cm-avatar-photo">
              {player.avatar ? <img className="cm-avatar-image" src={player.avatar} alt="" /> : player.nickname[0]}
            </div>
            <div>
              <h2 className="cm-section-title" id="profile-modal-title">{player.nickname}</h2>
              <p className="cm-muted">Rating {player.rating}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" type="button" aria-label="Close profile modal" onClick={onClose}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className="cm-panel-body">
          <div className="cm-list" aria-label={`${player.nickname} match history`}>
            {matchHistory.map((match) => {
              const result = getMatchResult(match, player.nickname)
              const opponent = getOpponent(match, player.nickname)

              return (
                <article className="cm-list-row" key={match.id}>
                  <i className="ti ti-chess text-accent" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-primary truncate">vs {opponent}</p>
                    <p className="cm-muted">{match.moves} moves</p>
                  </div>
                  <span className={getResultBadgeClass(result)}>{result}</span>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfileModal

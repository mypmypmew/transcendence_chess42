import AppLayout from '../components/AppLayout.jsx'
import useMatchmaking from '../hooks/useMatchmaking.js'

function getConnectionLabel(socketStatus) {
  // Convert internal socket states into short messages that are clear to the player.
  if (socketStatus === 'connected') {
    return 'Connected'
  }

  if (socketStatus === 'connecting') {
    return 'Connecting...'
  }

  if (socketStatus === 'error') {
    return 'Connection error'
  }

  return 'Disconnected'
}

function GameLobby() {
  const {
    isSearching,
    matchmakingError,
    socketStatus,
    startSearch,
    cancelSearch,
  } = useMatchmaking()

  const isConnected = socketStatus === 'connected'

  return (
    <AppLayout eyebrow="Game Lobby" title="Find an Opponent" showLegalFooter={false}>
      <section className="cm-panel" aria-labelledby="matchmaking-title">
        <div className="cm-panel-header">
          <div>
            <p className="cm-eyebrow">Online multiplayer</p>
            <h2 className="cm-section-title" id="matchmaking-title">
              Quick match
            </h2>
          </div>

          <span className={isConnected ? 'text-primary' : 'text-muted'}>
            {getConnectionLabel(socketStatus)}
          </span>
        </div>

        <div className="cm-panel-body flex flex-col gap-4">
          {isSearching ? (
            <>
              <div className="empty-state" aria-live="polite">
                <i className="ti ti-loader-2 text-accent" aria-hidden="true"/>
                <p className="text-primary">
                  Searching for an opponent...
                </p>
                <span className="text-muted">
                  The game will open automatically when another player joins.
                </span>
              </div>

              <button className="btn btn-ghost" type="button" onClick={cancelSearch}>
                Cancel search
              </button>
            </>
          ) : (
            <>
              <p className="cm-muted">
                Join the queue and play a real-time game against another
                authenticated player.
              </p>

              <button className="btn btn-primary" type="button" disabled={!isConnected} onClick={startSearch}>
                Find opponent
              </button>
            </>
          )}

          {matchmakingError && (
            <p className="text-muted" role="alert">
              {matchmakingError}
            </p>
          )}
        </div>
      </section>
    </AppLayout>
  )
}

export default GameLobby

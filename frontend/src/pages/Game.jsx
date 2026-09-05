import { useNavigate, useParams } from 'react-router-dom'

import AppLayout from '../components/AppLayout.jsx'
import ChessGame from '../components/ChessGame.jsx'
import useMultiplayerGame from '../hooks/useMultiplayerGame.js'

function Game() {
  const navigate = useNavigate()
  const { gameId: gameIdParam } = useParams()

  // Route parameters are strings, but the backend accepts only positive numeric game IDs.
  const gameId = Number(gameIdParam)

  const {
    game,
    gameError,
    opponent,
    gameDetailsError,
    isLoading,
    isWaitingForServer,
    socketStatus,
    playerColor,
    boardOrientation,
    isPlayerTurn,
    isGameOver,
    gameOverInfo,
    displayStatus,
    makeMove,
    resignGame,
  } = useMultiplayerGame(gameId)

  function returnToLobby() {
    // Starting another game requires a new server-created match.
    navigate('/game-lobby')
  }

  function returnToDashboard() {
    // Leave the finished game while keeping the normal authenticated navigation flow.
    navigate('/dashboard')
  }

  if (isLoading) {
    return (
      <AppLayout eyebrow="Game Screen" title="Multiplayer Chess" showLegalFooter={false}>
        <section className="cm-panel" aria-live="polite">
          <div className="cm-panel-body">
            <div className="empty-state">
              <i className="ti ti-loader-2 text-accent" aria-hidden="true" />
              <p className="text-primary">Loading game...</p>
              <span className="text-muted">Waiting for the latest server state.</span>
            </div>
          </div>
        </section>
      </AppLayout>
    )
  }

  if (!game) {
    return (
      <AppLayout eyebrow="Game Screen" title="Game Unavailable" showLegalFooter={false}>
        <section className="cm-panel">
          <div className="cm-panel-body flex flex-col gap-4">
            <p className="text-muted" role="alert">
              {gameError || 'Unable to load the game'}
            </p>
            <button className="btn btn-primary" type="button" onClick={returnToLobby}>
              Return to game lobby
            </button>
          </div>
        </section>
      </AppLayout>
    )
  }

  return (
    <AppLayout eyebrow="Game Screen" title="Multiplayer Chess" showLegalFooter={false}>
      {gameError && (
        <section className="cm-panel">
          <div className="cm-panel-body">
            <p className="text-muted" role="alert">
              {gameError}
            </p>
          </div>
        </section>
      )}

      <section className="cm-panel" aria-live="polite">
        <div className="cm-panel-body">
          {/* Show public opponent data loaded from the existing authenticated game endpoint. */}
          {opponent ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="label">Opponent</p>
                <h2 className="cm-section-title">{opponent.username}</h2>
              </div>

              <p className="text-muted">Rating: {opponent.rating}</p>
            </div>
          ) : (
            <p className="text-muted">
              {gameDetailsError || 'Loading opponent details...'}
            </p>
          )}
        </div>
      </section>
      
      <ChessGame
        fen={game.fen}
        status={displayStatus}
        isGameOver={isGameOver}
        gameOverInfo={gameOverInfo}
        playerColor={playerColor}
        isPlayerTurn={isPlayerTurn}
        boardOrientation={boardOrientation}
        isWaitingForServer={isWaitingForServer}
        socketStatus={socketStatus}
        showRestart={false}
        onMove={makeMove}
        onResign={resignGame}
        onRestart={returnToLobby}
        onExit={returnToDashboard}
      />
    </AppLayout>
  )
}

export default Game

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AppLayout from '../components/AppLayout.jsx'
import ChessGame from '../components/ChessGame.jsx'
import ChessGuideModal from '../components/ChessGuideModal.jsx'
import {
  Alert,
  Button,
  EmptyState,
  Panel,
  PanelBody,
} from '../components/ui.jsx'
import useMultiplayerGame from '../hooks/useMultiplayerGame.js'

function Game() {
  const navigate = useNavigate()
  const { gameId: gameIdParam } = useParams()

  // Keep the guide independent from the multiplayer game lifecycle.
  const [isGuideOpen, setIsGuideOpen] = useState(false)

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
        <Panel aria-live="polite">
          <PanelBody>
            <EmptyState
              icon="loader-2"
              subtitle="Waiting for the latest server state."
              title="Loading game..."
            />
          </PanelBody>
        </Panel>
      </AppLayout>
    )
  }

  if (!game) {
    return (
      <AppLayout eyebrow="Game Screen" title="Game Unavailable" showLegalFooter={false}>
        <Panel>
          <PanelBody className="flex flex-col gap-4">
            <Alert>{gameError || 'Unable to load the game'}</Alert>
            <Button type="button" onClick={returnToLobby}>
              Return to game lobby
            </Button>
          </PanelBody>
        </Panel>
      </AppLayout>
    )
  }

  return (
    <AppLayout eyebrow="Game Screen" title="Multiplayer Chess" showLegalFooter={false}>
      {gameError && (
        <Panel>
          <PanelBody>
            <Alert>{gameError}</Alert>
          </PanelBody>
        </Panel>
      )}
      
      <ChessGame
        fen={game.fen}
        status={displayStatus}
        isGameOver={isGameOver}
        gameOverInfo={gameOverInfo}
        opponent={opponent}
        opponentError={gameDetailsError}
        playerColor={playerColor}
        isPlayerTurn={isPlayerTurn}
        boardOrientation={boardOrientation}
        isWaitingForServer={isWaitingForServer}
        socketStatus={socketStatus}
        showRestart={false}
        onMove={makeMove}
        onResign={resignGame}
        onOpenRules={() => setIsGuideOpen(true)}
        onRestart={returnToLobby}
        onExit={returnToDashboard}
      />
      {/* Keep the board mounted so incoming moves continue while reading. */}
      {isGuideOpen && (
        <ChessGuideModal onClose={() => setIsGuideOpen(false)} />
      )}
    </AppLayout>
  )
}

export default Game

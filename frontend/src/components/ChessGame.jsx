import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import GameOverModal from './GameOverModal.jsx'
import {
  Button,
  Icon,
  Panel,
} from './ui.jsx'

const PROMOTION_OPTIONS = [
  { value: 'q', label: 'Queen' },
  { value: 'r', label: 'Rook' },
  { value: 'b', label: 'Bishop' },
  { value: 'n', label: 'Knight' },
]

function normalizeBoardOrientation(boardOrientation) {
  if (boardOrientation === 'black' || boardOrientation === 'b') {
    return 'black'
  }

  return 'white'
}

function colorLabel(color) {
  return color === 'b' || color === 'black' ? 'Black' : 'White'
}

function colorCode(color) {
  if (color === 'white') return 'w'
  if (color === 'black') return 'b'
  return color
}

function isPromotionMove(piece, targetSquare) {
  return (
    (piece?.pieceType === 'wP' && targetSquare?.[1] === '8') ||
    (piece?.pieceType === 'bP' && targetSquare?.[1] === '1')
  )
}

function ChessGame({
  fen,
  status,
  isGameOver,
  gameOverInfo,
  playerColor,
  isPlayerTurn = true,
  boardOrientation = 'white',
  isWaitingForServer = false,
  socketStatus = 'connected',
  showRestart = true,
  onMove,
  onResign,
  onRestart,
}) {
  const [isModalDismissed, setIsModalDismissed] = useState(false)
  const [pendingPromotion, setPendingPromotion] = useState(null)
  // Disable interaction until the authenticated player is allowed to send a move.
  const isBoardDisabled = 
    isGameOver ||
    pendingPromotion !== null ||
    isWaitingForServer ||
    !isPlayerTurn ||
    socketStatus !== 'connected'
  const normalizedOrientation = normalizeBoardOrientation(boardOrientation)
  const playerColorCode = colorCode(playerColor)

  function handlePieceDrop({ piece, sourceSquare, targetSquare }) {
    if (isBoardDisabled || !targetSquare) {
      return false
    }

    if (isPromotionMove(piece, targetSquare)) {
      setPendingPromotion({
        sourceSquare,
        targetSquare,
      })
      return false
    }

    return onMove(sourceSquare, targetSquare)
  }

  function canDragPiece({ piece }) {
    if (isBoardDisabled) {
      return false
    }

    // Allow the player to drag only pieces that match the color assigned by the backend.
    return (
      !playerColorCode ||
      piece?.pieceType?.startsWith(playerColorCode)
    )
  }

  function handlePromotionChoice(promotion) {
    if (!pendingPromotion) {
      return
    }

    const { sourceSquare, targetSquare } = pendingPromotion

    setPendingPromotion(null)
    onMove(sourceSquare, targetSquare, promotion)
  }

  function handleRestart() {
    setIsModalDismissed(false)
    setPendingPromotion(null)
    onRestart()
  }

  const chessboardOptions = {
    position: fen,
    boardOrientation: normalizedOrientation,
    onPieceDrop: handlePieceDrop,
    canDragPiece,
    allowDragging: !isBoardDisabled,
  }

  return (
    <>
      <div className="flex gap-3" aria-label="Game controls">
        {playerColorCode ? (
          <Button
            type="button"
            disabled={isGameOver || isWaitingForServer || socketStatus !== 'connected'}
            variant="ghost"
            onClick={() => onResign(playerColorCode)}
          >
            {colorLabel(playerColorCode)} resigns
          </Button>
        ) : (
          <>
            <Button
              type="button"
              disabled={isGameOver || isWaitingForServer}
              variant="ghost"
              onClick={() => onResign('w')}
            >
              White resigns
            </Button>

            <Button
              type="button"
              disabled={isGameOver || isWaitingForServer}
              variant="ghost"
              onClick={() => onResign('b')}
            >
              Black resigns
            </Button>
          </>
        )}

        {showRestart && (
        <Button type="button" disabled={isWaitingForServer} variant="ghost" onClick={handleRestart}>
          Restart
        </Button>
        )}
      </div>

      <div className="cm-board-layout">
        <Panel className="cm-game-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label">Game status</p>
              <h2 className="cm-section-title">{status}</h2>
            </div>
            <Icon className="text-accent" name="chess-knight" />
          </div>
        </Panel>

        {pendingPromotion && !isGameOver && (
          <Panel className="cm-game-card">
            <p className="label">Pawn promotion</p>
            <h2 className="cm-section-title">Choose a piece</h2>

            <div className="flex gap-3">
              {PROMOTION_OPTIONS.map((option) => (
                <Button
                  type="button"
                  key={option.value}
                  disabled={isWaitingForServer}
                  variant="ghost"
                  onClick={() => handlePromotionChoice(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </Panel>
        )}

        <Panel className="cm-game-card cm-chessboard-card">
          <div className="cm-chessboard-wrapper" data-board-disabled={isBoardDisabled} data-player-color={playerColorCode}>
            <Chessboard options={chessboardOptions} />
          </div>
        </Panel>
      </div>

      {isGameOver && !isModalDismissed && (
        <GameOverModal
          gameOverInfo={gameOverInfo}
          onClose={() => setIsModalDismissed(true)}
          onRestart={handleRestart}
        />
      )}
    </>
  )
}

export default ChessGame

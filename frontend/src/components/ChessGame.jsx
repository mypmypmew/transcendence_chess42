import { useState } from 'react'
import { Chess } from 'chess.js'
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

function getLegalMoveSquares(fen, sourceSquare, playerColorCode) {
  if (!fen || !sourceSquare || !playerColorCode) {
    return []
  }

  try {
    // Recreate the current server position only to calculate visual move hints.
    // The backend remains authoritative and validates every submitted move again.
    const chess = new Chess(fen)
    const selectedPiece = chess.get(sourceSquare)

    // Show hints only for the current player's piece when it is their turn.
    if (!selectedPiece ||
      selectedPiece.color !== playerColorCode ||
      chess.turn() !== playerColorCode
    ) {
      return []
    }

    return chess
      .moves({
        square: sourceSquare,
        verbose: true,
      })
      .map((move) => move.to)
  } catch {
    // Ignore an invalid or temporarily unavailable position instead of breaking the board.
    return []
  }
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
  onExit,
}) {
  const [isModalDismissed, setIsModalDismissed] = useState(false)
  const [pendingPromotion, setPendingPromotion] = useState(null)
  // Remember the selected source square so all legal destinations can be highlighted.
  const [selectedSquare, setSelectedSquare] = useState(null)
  // Disable interaction until the authenticated player is allowed to send a move.
  const isBoardDisabled = 
    isGameOver ||
    pendingPromotion !== null ||
    isWaitingForServer ||
    !isPlayerTurn ||
    socketStatus !== 'connected'
  const normalizedOrientation = normalizeBoardOrientation(boardOrientation)
  const playerColorCode = colorCode(playerColor)
  const legalMoveSquares = getLegalMoveSquares(
    fen,
    selectedSquare,
    playerColorCode,
  )

  const moveHintStyles = legalMoveSquares.reduce(
    (styles, square) => ({
      ...styles,
      [square]: {
        background:
          'radial-gradient(circle, rgba(118, 150, 86, 0.75) 0 22%, transparent 24%)',
      },
    }),
    legalMoveSquares.length > 0
      ? {
          [selectedSquare]: {
            boxShadow: 'inset 0 0 0 4px rgba(118, 150, 86, 0.8)',
          },
        }
      : {},
  )

  function handlePieceSelection({ piece, square }) {
    if (isBoardDisabled || !piece?.pieceType?.startsWith(playerColorCode)) {
      setSelectedSquare(null)
      return
    }

    // Selecting or dragging an available piece reveals all of its legal destinations.
    setSelectedSquare(square)
  }

  function handlePieceDrop({ piece, sourceSquare, targetSquare }) {
    // Remove old hints after the player finishes the drag attempt.
    setSelectedSquare(null)
    
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

  function handleSquareClick({ piece, square}) {
    if (isBoardDisabled) {
      setSelectedSquare(null)
      return
    }

    // A second click on a highlighted square submits the selected legal move.
    if (selectedSquare && legalMoveSquares.includes(square)) {
      const chess = new Chess(fen)
      const selectedPiece = chess.get(selectedSquare)

      setSelectedSquare(null)

      // Open the existing promotion selector when a pawn reachesits final rank.
      if (selectedPiece?.type === 'p' &&
        ((selectedPiece.color === 'w' && square[1] === '8') ||
        (selectedPiece.color === 'b' && square[1] === '1'))
      ) {
        setPendingPromotion({
          sourceSquare: selectedSquare,
          targetSquare: square,
        })
        return
      }

      onMove(selectedSquare, square)
      return
    }

    // Clicking another own piece replaces the current selection and its hints.
    handlePieceSelection({
      piece,
      square,
    })
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
    onSquareClick: handleSquareClick,
    onPieceDrag: handlePieceSelection,
    canDragPiece,
    allowDragging: !isBoardDisabled,
    squareStyles: moveHintStyles,
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

      {isGameOver && isModalDismissed && (
        <div className="flex gap-3" aria-label="Finished game navigation">
          {/* Keep navigation available after the player closes the game-over modal. */}
          <Button icon="refresh" type="button" onClick={handleRestart}>
            Play again
          </Button>

          {onExit && (
            <Button type="button" variant="ghost" onClick={onExit}>
              Back to dashboard
            </Button>
          )}
        </div>
      )}

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

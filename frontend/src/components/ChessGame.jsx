import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import GameOverModal from './GameOverModal.jsx'

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
  return color === 'black' ? 'b' : color
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
  boardOrientation = 'white',
  isWaitingForServer = false,
  onMove,
  onResign,
  onRestart,
}) {
  const [isModalDismissed, setIsModalDismissed] = useState(false)
  const [pendingPromotion, setPendingPromotion] = useState(null)
  const isBoardDisabled = isGameOver || pendingPromotion !== null || isWaitingForServer
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
    allowDragging: !isBoardDisabled,
  }

  return (
    <>
      <div className="flex gap-3" aria-label="Game controls">
        {playerColorCode ? (
          <button
            className="btn btn-ghost"
            type="button"
            disabled={isGameOver || isWaitingForServer}
            onClick={() => onResign(playerColorCode)}
          >
            {colorLabel(playerColorCode)} resigns
          </button>
        ) : (
          <>
            <button
              className="btn btn-ghost"
              type="button"
              disabled={isGameOver || isWaitingForServer}
              onClick={() => onResign('w')}
            >
              White resigns
            </button>

            <button
              className="btn btn-ghost"
              type="button"
              disabled={isGameOver || isWaitingForServer}
              onClick={() => onResign('b')}
            >
              Black resigns
            </button>
          </>
        )}

        <button className="btn btn-ghost" type="button" disabled={isWaitingForServer} onClick={handleRestart}>
          Restart
        </button>
      </div>

      <div className="cm-board-layout">
        <section className="cm-game-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label">Game status</p>
              <h2 className="cm-section-title">{status}</h2>
            </div>
            <i className="ti ti-chess-knight text-accent" aria-hidden="true" />
          </div>
        </section>

        {pendingPromotion && !isGameOver && (
          <section className="cm-game-card">
            <p className="label">Pawn promotion</p>
            <h2 className="cm-section-title">Choose a piece</h2>

            <div className="flex gap-3">
              {PROMOTION_OPTIONS.map((option) => (
                <button
                  className="btn btn-ghost"
                  type="button"
                  key={option.value}
                  disabled={isWaitingForServer}
                  onClick={() => handlePromotionChoice(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="cm-game-card cm-chessboard-card">
          <div className="cm-chessboard-wrapper">
            <Chessboard options={chessboardOptions} />
          </div>
        </section>
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

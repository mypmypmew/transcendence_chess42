import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import AppLayout from '../components/AppLayout.jsx'
import GameOverModal from '../components/GameOverModal.jsx'
import useChessGame from '../hooks/useChessGame.js'

function Game() {
  const {
    fen,
    status,
    isGameOver,
    gameOverInfo,
    makeMove,
    resignGame,
    restartGame } = useChessGame()
  const [isModalDismissed, setIsModalDismissed] = useState(false)
  const [pendingPromotion, setPendingPromotion] = useState(null)

  function handlePieceDrop({ piece, sourceSquare, targetSquare }) {
    const isPromotion =
      (piece.pieceType === 'wP' && targetSquare?.[1] === '8') ||
      (piece.pieceType === 'bP' && targetSquare?.[1] === '1')

    if (isPromotion) {
      setPendingPromotion({
        sourceSquare,
        targetSquare,
      })
      return false
    }

    return makeMove(sourceSquare, targetSquare)
  }

function handlePromotionChoice(promotion) {
  if (!pendingPromotion) {
    return
  }

  const { sourceSquare, targetSquare } = pendingPromotion

  setPendingPromotion(null)
  makeMove(sourceSquare, targetSquare, promotion)
}

  function handleRestart() {
    setIsModalDismissed(false)
    setPendingPromotion(null)
    restartGame()
  }

  const chessboardOptions = {
    position: fen,
    onPieceDrop: handlePieceDrop,
    allowDragging: !isGameOver && pendingPromotion === null,
  }

  return (
    <AppLayout
      eyebrow="Game Screen"
      title="Play Chess"
      actions={
              <>
        <button
          className="btn btn-ghost"
          type="button"
          disabled={isGameOver}
          onClick={() => resignGame('w')}
        >
          White resigns
        </button>

        <button
          className="btn btn-ghost"
          type="button"
          disabled={isGameOver}
          onClick={() => resignGame('b')}
        >
          Black resigns
        </button>

        <button className="btn btn-ghost" type="button" onClick={handleRestart}>
          Restart
        </button>
      </>
      }
    >
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
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => handlePromotionChoice('q')}
              >
                Queen
              </button>

              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => handlePromotionChoice('r')}
              >
                Rook
              </button>

              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => handlePromotionChoice('b')}
              >
                Bishop
              </button>

              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => handlePromotionChoice('n')}
              >
                Knight
              </button>
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
    </AppLayout>
  )
}
export default Game
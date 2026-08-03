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

  function handlePieceDrop({ sourceSquare, targetSquare }) {
    return makeMove(sourceSquare, targetSquare)
  }

  function handleRestart() {
    setIsModalDismissed(false)
    restartGame()
  }

  const chessboardOptions = {
    position: fen,
    onPieceDrop: handlePieceDrop,
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
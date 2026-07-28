import { Chessboard } from 'react-chessboard'
import AppLayout from '../components/AppLayout.jsx'
import GameOverModal from '../components/GameOverModal.jsx'
import useChessGame from '../hooks/useChessGame.js'

function Game() {
  const { fen, history, status, isGameOver, gameOverInfo, makeMove, restartGame } = useChessGame()

  function handlePieceDrop({ sourceSquare, targetSquare }) {
    return makeMove(sourceSquare, targetSquare)
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
        <button className="btn btn-ghost" type="button" onClick={restartGame}>
          Restart
        </button>
      }
    >
      <div className="cm-board-layout">
        <section className={`cm-game-card${isGameOver ? ' cm-game-card--over' : ''}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label">Game status</p>
              <h2 className="cm-section-title">{status}</h2>
            </div>
            <i className="ti ti-chess-knight text-accent" aria-hidden="true" />
          </div>
        </section>
        <section className="cm-game-card">
          <div style={{ width: 560 }}>
            <Chessboard options={chessboardOptions} />
          </div>
        </section>
        {/* ...move history без изменений... */}
      </div>

      {isGameOver && (
        <GameOverModal gameOverInfo={gameOverInfo} onRestart={restartGame} />
      )}
    </AppLayout>
  )
}
export default Game
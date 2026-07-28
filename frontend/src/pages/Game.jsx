import { Chessboard } from 'react-chessboard'
import AppLayout from '../components/AppLayout.jsx'
import useChessGame from '../hooks/useChessGame.js'

function Game() {
  const { fen, history, status, makeMove, restartGame } = useChessGame()

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
        {/* ... */}
        <section className="cm-game-card">
          <div style={{ width: 560 }}>
            <Chessboard options={chessboardOptions} />
          </div>
        </section>
        {/* ... */}
      </div>
    </AppLayout>
  )
}
export default Game
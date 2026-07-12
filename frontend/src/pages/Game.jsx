import { Chessboard } from 'react-chessboard'
import AppLayout from '../components/AppLayout.jsx'
import useChessGame from '../hooks/useChessGame.js'
function Game() {
  const { fen, history, status, makeMove, restartGame } = useChessGame()
  function handlePieceDrop(sourceSquare, targetSquare) {
    return makeMove(sourceSquare, targetSquare)
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
        <section className="cm-game-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label">Game status</p>
              <h2 className="cm-section-title">{status}</h2>
            </div>
            <i className="ti ti-chess-knight text-accent" aria-hidden="true" />
          </div>
        </section>
        <section className="cm-game-card">
          <Chessboard
            position={fen}
            onPieceDrop={handlePieceDrop}
            boardWidth={560}
          />
        </section>
        <section className="cm-game-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label">Move history</p>
              <h2 className="cm-section-title">{history.length} moves</h2>
            </div>
          </div>
          <div className="cm-move-list">
            {history.length === 0 && (
              <div className="empty-state">
                <i className="ti ti-list" aria-hidden="true" />
                <p className="text-primary">No moves yet</p>
                <span className="text-muted">Make the first move on the board.</span>
              </div>
            )}
            {history.map((move, index) => (
              <div className="cm-move-row" key={`${move}-${index}`}>
                <span>{index + 1}</span>
                <span>{move}</span>
                <span />
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
export default Game
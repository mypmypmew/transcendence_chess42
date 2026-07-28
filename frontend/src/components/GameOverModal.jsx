function getGameOverMessage(gameOverInfo) {
  if (!gameOverInfo) return ''
  if (gameOverInfo.type === 'checkmate') {
    return `${gameOverInfo.winner} wins by checkmate`
  }
  if (gameOverInfo.type === 'stalemate') {
    return 'Draw by stalemate'
  }
  return 'Draw'
}

function GameOverModal({ gameOverInfo, onRestart }) {
  return (
    <div className="cm-modal-backdrop" role="dialog" aria-modal="true">
      <div className="cm-modal cm-game-over-modal">
        <i className="ti ti-crown text-accent" aria-hidden="true" />
        <h2 className="cm-section-title">Game over</h2>
        <p className="text-primary">{getGameOverMessage(gameOverInfo)}</p>
        <button className="btn btn-primary" type="button" onClick={onRestart}>
          Play again
        </button>
      </div>
    </div>
  )
}
export default GameOverModal

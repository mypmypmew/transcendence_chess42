import './Modal.css'

function getGameOverContent(gameOverInfo) {
  if (gameOverInfo?.type === 'checkmate') {
    return {
      icon: 'ti-crown',
      title: 'Checkmate',
      message: `${gameOverInfo.winner} wins by checkmate`,
    }
  }
  if (gameOverInfo?.type === 'resignation') {
    return {
      icon: 'ti-flag',
      title: 'Resignation',
      message: `${gameOverInfo.winner} wins by resignation.`,
    }
  }
  if (gameOverInfo?.type === 'stalemate') {
    return {
      icon: 'ti-flag-3',
      title: 'Stalemate',
      message: 'No legal moves remain — the game is a draw.',
    }
  }
  return {
    icon: 'ti-flag-3',
    title: 'Draw',
    message: 'The game has ended in a draw.',
  }
}

function GameOverModal({ gameOverInfo, onClose, onRestart }) {
  const { icon, title, message } = getGameOverContent(gameOverInfo)

  return (
    <div className="cm-modal" role="dialog" aria-modal="true" aria-labelledby="game-over-title">
      <button className="cm-modal__backdrop" type="button" aria-label="Close game over modal" onClick={onClose} />
      <div className="cm-panel cm-modal__content cm-modal__content--sm">
        <div className="cm-panel-header">
          <div>
            <h2 className="cm-section-title" id="game-over-title">Game over</h2>
            <p className="cm-muted">{message}</p>
          </div>
          <div className="cm-modal__header-actions">
            <button className="btn btn-ghost btn-icon" type="button" aria-label="Close game over modal" onClick={onClose}>
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="cm-panel-body">
          <div className="empty-state">
            <i className={`ti ${icon} text-accent`} aria-hidden="true" />
            <p className="text-primary">{title}</p>
            <span className="text-muted">{message}</span>
          </div>
        </div>
        <div className="cm-modal__actions">
          <button className="btn btn-primary" type="button" onClick={onRestart}>
            <i className="ti ti-refresh" aria-hidden="true" />
            Play again
          </button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Review board
          </button>
        </div>
      </div>
    </div>
  )
}
export default GameOverModal
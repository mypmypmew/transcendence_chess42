import './Modal.css'
import {
  Button,
  EmptyState,
  IconButton,
  Panel,
  PanelBody,
  PanelHeader,
} from './ui.jsx'

function getGameOverContent(gameOverInfo) {
  if (gameOverInfo?.type === 'checkmate') {
    return {
      icon: 'crown',
      title: 'Checkmate',
      message: `${gameOverInfo.winner} wins by checkmate`,
    }
  }
  if (gameOverInfo?.type === 'resignation') {
    return {
      icon: 'flag',
      title: 'Resignation',
      message: `${gameOverInfo.winner} wins by resignation.`,
    }
  }
  if (gameOverInfo?.type === 'stalemate') {
    return {
      icon: 'flag-3',
      title: 'Stalemate',
      message: 'No legal moves remain — the game is a draw.',
    }
  }
  return {
    icon: 'flag-3',
    title: 'Draw',
    message: 'The game has ended in a draw.',
  }
}

function GameOverModal({ gameOverInfo, onClose, onRestart, onExit }) {
  const { icon, title, message } = getGameOverContent(gameOverInfo)

  return (
    <div className="cm-modal" role="dialog" aria-modal="true" aria-labelledby="game-over-title">
      <button className="cm-modal__backdrop" type="button" aria-label="Close game over modal" onClick={onClose} />
      <Panel as="div" className="cm-modal__content cm-modal__content--sm">
        <PanelHeader
          action={<IconButton aria-label="Close game over modal" icon="x" onClick={onClose} />}
          title="Game over"
          titleId="game-over-title"
        >
          <p className="cm-muted">{message}</p>
        </PanelHeader>
        <PanelBody>
          <EmptyState
            icon={icon}
            title={title}
            subtitle={message}
          />
        </PanelBody>
        <div className="cm-modal__actions">
          <Button icon="refresh" type="button" onClick={onRestart}>
            Play again
          </Button>

          <Button type="button" variant="ghost" onClick={onClose}>
            Review board
          </Button>

          {/* Allow the player to leave a completed game directly from the result modal. */}
          {onExit && (
            <Button type="button" variant="ghost" onClick={onExit}>
              Back to dashboard
            </Button>
          )}
        </div>
      </Panel>
    </div>
  )
}
export default GameOverModal

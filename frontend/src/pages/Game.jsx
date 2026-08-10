import AppLayout from '../components/AppLayout.jsx'
import ChessGame from '../components/ChessGame.jsx'
import useChessGame from '../hooks/useChessGame.js'

function Game() {
  const {
    fen,
    status,
    isGameOver,
    gameOverInfo,
    makeMove,
    resignGame,
    restartGame,
  } = useChessGame()

  return (
    <AppLayout eyebrow="Game Screen" title="Play Chess">
      <ChessGame
        fen={fen}
        status={status}
        isGameOver={isGameOver}
        gameOverInfo={gameOverInfo}
        playerColor={null}
        boardOrientation="white"
        onMove={makeMove}
        onResign={resignGame}
        onRestart={restartGame}
      />
    </AppLayout>
  )
}

export default Game

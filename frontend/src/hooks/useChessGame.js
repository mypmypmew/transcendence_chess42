import { useMemo, useState } from 'react'
import { Chess } from 'chess.js'

function getGameStatus(game) {
  if (game.isCheckmate()) {
    return 'Checkmate'
  }
  if (game.isStalemate()) {
    return 'Stalemate'
  }
  if (game.isDraw()) {
    return 'Draw'
  }
  if (game.isCheck()) {
    return `${game.turn() === 'w' ? 'White' : 'Black'} is in check`
  }
  return `${game.turn() === 'w' ? 'White' : 'Black'} to move`
}

function getGameOverInfo(game) {
  if (game.isCheckmate()) {
    const winner = game.turn() === 'w' ? 'Black' : 'White'
    return { type: 'checkmate', winner }
  }
  if (game.isStalemate()) {
    return { type: 'stalemate' }
  }
  if (game.isDraw()) {
    return { type: 'draw' }
  }
  return null
}

function useChessGame() {
  const game = useMemo(() => new Chess(), [])
  const [fen, setFen] = useState(game.fen())
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState(getGameStatus(game))
  const [gameOverInfo, setGameOverInfo] = useState(null)

  function syncGameState() {
    setFen(game.fen())
    setHistory(game.history())
    setStatus(getGameStatus(game))
    setGameOverInfo(getGameOverInfo(game))
  }

  function makeMove(sourceSquare, targetSquare) {
    if (game.isGameOver()) {
      return false
    }
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      })
      if (!move) {
        return false
      }
      syncGameState()
      return true
    } catch {
      return false
    }
  }

  function restartGame() {
    game.reset()
    syncGameState()
  }

  return {
    fen,
    history,
    status,
    isGameOver: gameOverInfo !== null,
    gameOverInfo,
    makeMove,
    restartGame,
  }
}
export default useChessGame
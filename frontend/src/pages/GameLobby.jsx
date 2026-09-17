import AppLayout from '../components/AppLayout.jsx'
import {
  Alert,
  Button,
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
  StatusDot,
} from '../components/ui.jsx'
import useMatchmaking from '../hooks/useMatchmaking.js'

function getConnectionLabel(socketStatus) {
  // Convert internal socket states into short messages that are clear to the player.
  if (socketStatus === 'connected') {
    return 'Connected'
  }

  if (socketStatus === 'connecting') {
    return 'Connecting...'
  }

  if (socketStatus === 'error') {
    return 'Connection error'
  }

  return 'Disconnected'
}

function GameLobby() {
  const {
    isSearching,
    matchmakingError,
    socketStatus,
    startSearch,
    cancelSearch,
  } = useMatchmaking()

  const isConnected = socketStatus === 'connected'
  const connectionStatus = isConnected ? 'online' : 'offline'

  return (
    <AppLayout eyebrow="Game Lobby" title="Find an Opponent" showLegalFooter={false}>
      <Panel aria-labelledby="matchmaking-title">
        <PanelHeader
          eyebrow="Online multiplayer"
          title="Quick match"
          titleId="matchmaking-title"
          action={(
            <span className={`flex items-center gap-2 ${isConnected ? 'text-primary' : 'text-muted'}`}>
              <StatusDot status={connectionStatus} />
              {getConnectionLabel(socketStatus)}
            </span>
          )}
        />

        <PanelBody className="flex flex-col gap-4">
          {isSearching ? (
            <>
              <EmptyState
                aria-live="polite"
                icon="loader-2"
                subtitle="The game will open automatically when another player joins."
                title="Searching for an opponent..."
              />

              <Button type="button" variant="ghost" onClick={cancelSearch}>
                Cancel search
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="cm-muted min-w-0">
                Join the queue and play a real-time game against another
                authenticated player.
              </p>

              <Button type="button" disabled={!isConnected} onClick={startSearch}>
                Find opponent
              </Button>
            </div>
          )}

          {matchmakingError && (
            <Alert>
              {matchmakingError}
            </Alert>
          )}
        </PanelBody>
      </Panel>
    </AppLayout>
  )
}

export default GameLobby

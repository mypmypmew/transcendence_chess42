import { useEffect, useState } from "react"
import { Navigate } from 'react-router-dom'

import { getActiveGame } from "../api/gameApi"
import AppLayout from "../components/AppLayout"
import {
    Alert,
    Button,
    EmptyState,
    Panel,
    PanelBody,
} from '../components/ui.jsx'
import GameLobby from './GameLobby.jsx'

function GameEntry() {
    const [lookupAttempt, setLookupAttempt] = useState(0)
    const [lookup, setLookup] = useState({
        status: 'loading',
        game: null,
        error: null,
    })

    useEffect(() => {
        let isCancelled = false

        async function loadActiveGame() {
            try {
                const response = await getActiveGame()

                if (!isCancelled) {
                    setLookup({
                        status: 'success',
                        game: response.game,
                        error: null,
                    })
                }
            } catch (error) {
                if (!isCancelled) {
                    setLookup({
                        status: 'error',
                        game: null,
                        error: error.message || 'Unable to check for an active game',
                    })
                }
            }
        }

        loadActiveGame()

        return () => {
            isCancelled = true
        }
    }, [lookupAttempt])

    function retryLookup() {
        setLookup({
            status: 'loading',
            game: null,
            error: null,
        })
        setLookupAttempt((current) => current + 1)
    }

    if (lookup.status === 'loading') {
        return (
        <AppLayout eyebrow="Game" title="Checking active game" showLegalFooter={false}>
            <Panel aria-live="polite">
                <PanelBody>
                    <EmptyState
                    icon="loader-2"
                    title="Checking for an active game..."
                    />
                </PanelBody>
            </Panel>
        </AppLayout>
        )
    }

    if (lookup.status === 'error') {
        return (
        <AppLayout eyebrow="Game" title="Game unavailable" showLegalFooter={false}>
            <Panel>
                <PanelBody className="flex flex-col gap-4">
                    <Alert>{lookup.error}</Alert>
                    <Button type="button" onClick={retryLookup}>
                    Try again
                    </Button>
                </PanelBody>
            </Panel>
        </AppLayout>
        )
    }

    if (lookup.game) {
        return <Navigate to={`/game/${lookup.game.gameId}`} replace />
    }

    return <GameLobby />
}

export default GameEntry
import { Link } from 'react-router-dom'

import {
  Button,
  Icon,
  Panel,
  PanelBody,
  PanelHeader,
} from '../../components/ui.jsx'

function TermsOfService() {
  return (
    <main className="cm-shell fade-in">
      <div className="cm-app-frame">
        <Panel aria-labelledby="terms-of-service-title" className="flex flex-col flex-1">
          <PanelHeader
            action={<Button as={Link} to="/" variant="ghost">Back</Button>}
          >
            <Link className="cm-brand" to="/">
              <Icon name="crown" />
              <span>ChessMate</span>
            </Link>
          </PanelHeader>

          <PanelBody className="cm-content flex flex-col gap-4">
            <p className="label">Legal</p>
            <h1 className="cm-hero-title" id="terms-of-service-title">Terms of Service</h1>

            <h2>Overview</h2>
            <p className="text-secondary">
              ChessMate is a project application for playing chess and using account, profile,
              friends, leaderboard, chat, and match history features. These terms describe the rules
              for using the app.
            </p>

            <h2>Accounts</h2>
            <p className="text-secondary">
              Users are responsible for the account information they provide and for keeping their
              login credentials private. Users agree not to access another user account, share unauthorized
              access, upload misleading profile information, or try to bypass authentication.
            </p>

            <h2>Fair play</h2>
            <p className="text-secondary">
              Users agree to play fairly and not exploit bugs, manipulate results, abuse game logic,
              or use automated behavior that gives an unfair advantage.
            </p>

            <h2>Social features</h2>
            <p className="text-secondary">
              Users agree not to use chat messages, profiles, avatars, friend requests, or other social
              features to spam, harass, impersonate, threaten, or share harmful content.
            </p>

            <h2>Real-time features</h2>
            <p className="text-secondary">
              ChessMate uses real-time socket connections for presence, matchmaking, games, and chat.
              Users agree not to abuse reconnect behavior, duplicate actions, or client events to disrupt
              games, conversations, or leaderboard records.
            </p>

            <h2>Project limitations</h2>
            <p className="text-secondary">
              ChessMate is built as a student project. The app provides chess games, profiles,
              friends, leaderboard, chat, avatar uploads, and real-time multiplayer features.
            </p>

            <h2>Project services</h2>
            <p className="text-secondary">
              The app uses backend APIs, Socket.IO connections, local avatar upload storage, and Google Fonts
              as part of the project experience.
            </p>
          </PanelBody>
        </Panel>
      </div>
    </main>
  )
}

export default TermsOfService

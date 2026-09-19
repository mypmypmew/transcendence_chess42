import { Link } from 'react-router-dom'

import {
  Button,
  Icon,
  Panel,
  PanelBody,
  PanelHeader,
} from '../../components/ui.jsx'

function PrivacyPolicy() {
  return (
    <main className="cm-shell fade-in">
      <div className="cm-app-frame">
        <Panel aria-labelledby="privacy-policy-title" className="flex flex-col flex-1">
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
            <h1 className="cm-hero-title" id="privacy-policy-title">Privacy Policy</h1>

            <h2>Overview</h2>
            <p className="text-secondary">
              ChessMate uses personal data only to provide the features of the application.
            </p>

            <h2>Data we collect</h2>
            <p className="text-secondary">
              The app stores account data such as username, email, password hash, session data,
              rating, avatar path, friends, friend requests, game history, conversations, and chat messages.
              Uploaded avatar image files are stored by the backend upload feature.
            </p>

            <h2>How we use data</h2>
            <p className="text-secondary">
              We use this data to create and protect accounts, keep users signed in, show profiles,
              manage friends and friend requests, record games, display match history, update leaderboard data,
              deliver chat messages, show avatars, and support real-time app features such as presence,
              matchmaking, game updates, and chat events.
            </p>

            <h2>Passwords and sessions</h2>
            <p className="text-secondary">
              Passwords are stored as hashes, not as plain text. The app uses a session cookie to keep
              users signed in, protect private routes, and authenticate Socket.IO connections.
            </p>

            <h2>Files and services</h2>
            <p className="text-secondary">
              Avatar files are stored locally or in the configured Docker volume. Socket connections are
              served by the project backend. The frontend bundles its fonts and icon assets with the application and does not fetch them from third-party CDNs at runtime.
            </p>

            <h2>Logs and operations</h2>
            <p className="text-secondary">
              The backend logs operational events such as server startup, socket connection lifecycle,
              disconnect reasons, and error details for development and troubleshooting.
            </p>
          </PanelBody>
        </Panel>
      </div>
    </main>
  )
}

export default PrivacyPolicy

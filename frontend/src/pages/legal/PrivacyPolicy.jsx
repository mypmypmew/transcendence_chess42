import { Link } from 'react-router-dom'

import LegalFooter from '../../components/LegalFooter.jsx'
import {
  Button,
  Icon,
  Panel,
  PanelBody,
  PanelHeader,
} from '../../components/ui.jsx'
import '../App.css'

function PrivacyPolicy() {
  return (
    <main className="cm-shell fade-in">
      <div className="cm-app-frame">
        <Panel aria-labelledby="privacy-policy-title">
          <PanelHeader
            action={<Button as={Link} to="/" variant="ghost">Back</Button>}
          >
            <Link className="cm-brand" to="/">
              <Icon name="crown" />
              <span>ChessMate</span>
            </Link>
          </PanelHeader>

          <PanelBody className="flex flex-col gap-4">
            <p className="label">Legal</p>
            <h1 className="cm-section-title" id="privacy-policy-title">Privacy Policy</h1>

            <h2>Overview</h2>
            <p className="text-secondary">
              ChessMate uses personal data only to provide the features of the application.
              This draft is based on the current project scope and must be reviewed again before the final release.
            </p>

            <h2>Data we collect</h2>
            <p className="text-secondary">
              The app may store account data such as username, email, password hash, session data,
              rating, friends, friend requests, and game history. If chat, avatars, uploads, or logs are added,
              this policy must also describe how that data is handled.
            </p>

            <h2>How we use data</h2>
            <p className="text-secondary">
              We use this data to create and protect accounts, keep users signed in, show profiles,
              manage friends and friend requests, record games, display match history, update leaderboard data,
              and support real-time app features.
            </p>

            <h2>Passwords and sessions</h2>
            <p className="text-secondary">
              Passwords must be stored as hashes, not as plain text. Session cookies may be used
              to keep users signed in, protect private routes, and authenticate socket connections.
            </p>

            <h2>External services</h2>
            <p className="text-secondary">
              The current project does not show a final external service integration. If OAuth,
              email sending, analytics, cloud storage, monitoring, hosting providers, or other external APIs are added,
              this policy must explain which services are used and what data is shared with them.
            </p>

            <h2>Final review</h2>
            <p className="text-secondary">
              Before release, this file must be checked against the final backend, database schema,
              stored user data, authentication flow, chat behavior, uploads, logs, and external services.
            </p>

            <LegalFooter />
          </PanelBody>
        </Panel>
      </div>
    </main>
  )
}

export default PrivacyPolicy

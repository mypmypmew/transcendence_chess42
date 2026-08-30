import { Link } from 'react-router-dom'

import LegalFooter from '../../components/LegalFooter.jsx'
import { Button, Icon, Panel, PanelBody, PanelHeader } from '../../components/ui.jsx'
import '../App.css'

function TermsOfService() {
  return (
    <main className="cm-shell fade-in">
      <div className="cm-app-frame">
        <Panel aria-labelledby="terms-of-service-title">
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
            <h1 className="cm-section-title" id="terms-of-service-title">Terms of Service</h1>

            <h2>Overview</h2>
            <p className="text-secondary">
              ChessMate is a project application for playing chess and using account, profile,
              friends, leaderboard, chat, and match history features. These draft terms describe
              the expected rules for using the app.
            </p>

            <h2>Accounts</h2>
            <p className="text-secondary">
              Users are responsible for the account information they provide and for keeping their
              login credentials private. Users must not access another user account, share unauthorized access,
              or try to bypass authentication.
            </p>

            <h2>Fair play</h2>
            <p className="text-secondary">
              Users must play fairly. They must not exploit bugs, manipulate results, abuse game logic,
              or use automated behavior that gives an unfair advantage unless the final project explicitly allows it.
            </p>

            <h2>Social features</h2>
            <p className="text-secondary">
              Users must not use chat, profiles, friend requests, or other social features to spam,
              harass, impersonate, threaten, or share harmful content. If moderation tools are added,
              the final terms must describe how they work.
            </p>

            <h2>Project limitations</h2>
            <p className="text-secondary">
              ChessMate is built as a student project and may include unfinished, experimental,
              or local-development-only features. During development and testing, data or functionality may change.
            </p>

            <h2>Final review</h2>
            <p className="text-secondary">
              Before release, this file must be checked against the final game rules, chat behavior,
              upload features, moderation decisions, stored user data, and external services.
            </p>

            <LegalFooter />
          </PanelBody>
        </Panel>
      </div>
    </main>
  )
}

export default TermsOfService

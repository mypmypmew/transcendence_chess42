import { Link } from 'react-router-dom'

import LegalFooter from '../../components/LegalFooter.jsx'
import '../Auth.css'
import '../App.css'

const privacySections = [
  'What user data we collect',
  'Why we collect this data',
  'Where the data is stored',
  'Session cookies and authentication',
  'Game history and profile data',
  'How users can request access to their data',
  'How users can request deletion of their data',
  'Future review notes for backend changes',
]

function PrivacyPolicy() {
  return (
    <main className="auth-scene fade-in">
      <section className="auth-panel" aria-labelledby="privacy-policy-title">
        <div className="auth-card">
          <header className="auth-card-intro">
            <Link className="cm-brand justify-center" to="/">
              <i className="ti ti-crown" aria-hidden="true" />
              <span>ChessMate</span>
            </Link>
            <p className="auth-kicker">Legal</p>
            <h1 className="auth-title" id="privacy-policy-title">Privacy Policy</h1>
          </header>

          <div className="auth-form">
            <p className="auth-subtitle">
              This page is a document skeleton. The final legal text should be reviewed before release.
            </p>

            <ol className="cm-list">
              {privacySections.map((section) => (
                <li className="cm-list-row" key={section}>
                  <i className="ti ti-file-text text-accent" aria-hidden="true" />
                  <span className="text-primary">{section}</span>
                </li>
              ))}
            </ol>
          </div>

          <LegalFooter />

          <footer className="auth-footer">
            <Link className="auth-link" to="/">Back to ChessMate</Link>
          </footer>
        </div>
      </section>
    </main>
  )
}

export default PrivacyPolicy

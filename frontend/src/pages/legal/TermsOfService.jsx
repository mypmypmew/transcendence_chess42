import { Link } from 'react-router-dom'

import LegalFooter from '../../components/LegalFooter.jsx'
import '../Auth.css'
import '../App.css'

const termsSections = [
  'Rules for using the application',
  'Account safety and credentials',
  'Fair use of game features',
  'Chat behavior and community rules',
  'Project limitations',
  'Availability and experimental features',
  'User responsibility',
  'Future review notes for backend changes',
]

function TermsOfService() {
  return (
    <main className="auth-scene fade-in">
      <section className="auth-panel" aria-labelledby="terms-of-service-title">
        <div className="auth-card">
          <header className="auth-card-intro">
            <Link className="cm-brand justify-center" to="/">
              <i className="ti ti-crown" aria-hidden="true" />
              <span>ChessMate</span>
            </Link>
            <p className="auth-kicker">Legal</p>
            <h1 className="auth-title" id="terms-of-service-title">Terms of Service</h1>
          </header>

          <div className="auth-form">
            <p className="auth-subtitle">
              This page is a document skeleton. The final legal text should be reviewed before release.
            </p>

            <ol className="cm-list">
              {termsSections.map((section) => (
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

export default TermsOfService

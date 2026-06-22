import { useState } from 'react'
import { Link } from 'react-router-dom'

import './Auth.css'
import './App.css'

function Register() {
  const [serverError] = useState('')

  return (
    <main className="auth-scene fade-in">
      <section className="auth-panel" aria-labelledby="register-title">
        <div className="auth-card">
          <header className="auth-card-intro">
            <div className="auth-mark" aria-hidden="true">
              <i className="ti ti-chess-knight" />
            </div>
            <p className="auth-kicker">Join ChessMate</p>
            <h1 className="auth-title" id="register-title">Build your chess journey</h1>
            <p className="auth-subtitle">
              Create a profile, follow progress, and prepare for smarter games
            </p>
          </header>

          <div className="auth-form">
            <div className="auth-error-slot" aria-live="polite">
              {serverError && (
                <div className="alert alert-error visible" role="alert">
                  <i className="ti ti-alert-circle" aria-hidden="true" />
                  <span>{serverError}</span>
                </div>
              )}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="register-name">Username</label>
              <input className="input" id="register-name" placeholder="ChessPlayer" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="register-email">Email</label>
              <input className="input" id="register-email" placeholder="you@example.com" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="register-password">Password</label>
              <input
                className="input"
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create password"
                aria-describedby="register-password-policy"
              />
              <div
                className="policy-box"
                id="register-password-policy"
                aria-label="Password requirements"
              >
                <span className="policy-rule">
                  <i className="ti ti-circle" aria-hidden="true" />
                  At least 8 characters
                </span>
                <span className="policy-rule">
                  <i className="ti ti-circle" aria-hidden="true" />
                  One uppercase letter
                </span>
                <span className="policy-rule">
                  <i className="ti ti-circle" aria-hidden="true" />
                  One number
                </span>
                <span className="policy-rule">
                  <i className="ti ti-circle" aria-hidden="true" />
                  One special character
                </span>
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="register-confirm-password">
                Confirm Password
              </label>
              <input
                className="input"
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
              />
            </div>
            <Link className="btn btn-primary btn-full" to="/dashboard">
              Create account
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </Link>
          </div>

          <footer className="auth-footer">
            <span>Already have an account?</span>
            <Link className="auth-link" to="/login">Sign in</Link>
          </footer>
        </div>
      </section>
    </main>
  )
}

export default Register

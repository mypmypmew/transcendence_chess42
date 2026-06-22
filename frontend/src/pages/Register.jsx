import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import './Auth.css'
import './App.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOCK_DELAY_MS = 800
const MOCK_TAKEN_EMAIL = 'taken@test.com'
const MOCK_TAKEN_USERNAME = 'taken'

function mockRegister({ email, username }) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      const isTaken = email.toLowerCase() === MOCK_TAKEN_EMAIL
        || username.toLowerCase() === MOCK_TAKEN_USERNAME

      if (isTaken) {
        reject(new Error('Email/Username already taken'))
        return
      }

      resolve()
    }, MOCK_DELAY_MS)
  })
}

function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const trimmedUsername = username.trim()
  const trimmedEmail = email.trim()
  const passwordPolicy = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    specialCharacter: /[^A-Za-z0-9\s]/.test(password),
  }
  const passwordMeetsPolicy = Object.values(passwordPolicy).every(Boolean)
  const emailIsValid = EMAIL_PATTERN.test(trimmedEmail)
  const passwordsMatch = password === confirmPassword

  const usernameError = touched.username && trimmedUsername === ''
    ? 'Username is required'
    : ''
  const emailError = touched.email && trimmedEmail === ''
    ? 'Email is required'
    : touched.email && !emailIsValid
      ? 'Enter a valid email address'
      : ''
  const passwordError = touched.password && password === ''
    ? 'Password is required'
    : touched.password && !passwordMeetsPolicy
      ? 'Password does not meet the requirements'
      : ''
  const confirmPasswordError = touched.confirmPassword && confirmPassword === ''
    ? 'Confirm Password is required'
    : touched.confirmPassword && !passwordsMatch
      ? 'Passwords do not match'
      : ''

  const isFormValid = trimmedUsername !== ''
    && trimmedEmail !== ''
    && emailIsValid
    && password !== ''
    && passwordMeetsPolicy
    && confirmPassword !== ''
    && passwordsMatch

  function handleBlur(fieldName) {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [fieldName]: true,
    }))
  }

  function clearServerError() {
    if (serverError) {
      setServerError('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    })
    setServerError('')

    if (!isFormValid) {
      return
    }

    setIsLoading(true)

    try {
      await mockRegister({ email: trimmedEmail, username: trimmedUsername })
      navigate('/dashboard')
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

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

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
              <input
                className={`input ${usernameError ? 'error' : ''}`}
                id="register-name"
                name="username"
                autoComplete="username"
                placeholder="ChessPlayer"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value)
                  clearServerError()
                }}
                onBlur={() => handleBlur('username')}
                aria-invalid={Boolean(usernameError)}
                aria-describedby={usernameError ? 'register-name-error' : undefined}
              />
              <div
                className={`field-error ${usernameError ? 'visible' : ''}`}
                id="register-name-error"
              >
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>{usernameError}</span>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="register-email">Email</label>
              <input
                className={`input ${emailError ? 'error' : ''}`}
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  clearServerError()
                }}
                onBlur={() => handleBlur('email')}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? 'register-email-error' : undefined}
              />
              <div
                className={`field-error ${emailError ? 'visible' : ''}`}
                id="register-email-error"
              >
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>{emailError}</span>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="register-password">Password</label>
              <input
                className={`input ${passwordError ? 'error' : ''}`}
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  clearServerError()
                }}
                onBlur={() => handleBlur('password')}
                aria-invalid={Boolean(passwordError)}
                aria-describedby="register-password-policy register-password-error"
              />
              <div
                className="policy-box"
                id="register-password-policy"
                aria-label="Password requirements"
              >
                <span className={`policy-rule ${passwordPolicy.minLength ? 'ok' : ''}`}>
                  <i className={`ti ti-${passwordPolicy.minLength ? 'check' : 'circle'}`} aria-hidden="true" />
                  At least 8 characters
                </span>
                <span className={`policy-rule ${passwordPolicy.uppercase ? 'ok' : ''}`}>
                  <i className={`ti ti-${passwordPolicy.uppercase ? 'check' : 'circle'}`} aria-hidden="true" />
                  One uppercase letter
                </span>
                <span className={`policy-rule ${passwordPolicy.number ? 'ok' : ''}`}>
                  <i className={`ti ti-${passwordPolicy.number ? 'check' : 'circle'}`} aria-hidden="true" />
                  One number
                </span>
                <span className={`policy-rule ${passwordPolicy.specialCharacter ? 'ok' : ''}`}>
                  <i className={`ti ti-${passwordPolicy.specialCharacter ? 'check' : 'circle'}`} aria-hidden="true" />
                  One special character
                </span>
              </div>
              <div
                className={`field-error ${passwordError ? 'visible' : ''}`}
                id="register-password-error"
              >
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>{passwordError}</span>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="register-confirm-password">
                Confirm Password
              </label>
              <input
                className={`input ${confirmPasswordError ? 'error' : ''}`}
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  clearServerError()
                }}
                onBlur={() => handleBlur('confirmPassword')}
                aria-invalid={Boolean(confirmPasswordError)}
                aria-describedby={confirmPasswordError ? 'register-confirm-password-error' : undefined}
              />
              <div
                className={`field-error ${confirmPasswordError ? 'visible' : ''}`}
                id="register-confirm-password-error"
              >
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>{confirmPasswordError}</span>
              </div>
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create account'}
              {!isLoading && <i className="ti ti-arrow-right" aria-hidden="true" />}
            </button>
          </form>

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

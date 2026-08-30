import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import LegalFooter from '../components/LegalFooter.jsx'
import { Alert, Button, Icon } from '../components/ui.jsx'
import { useAuth } from '../context/AuthContext.jsx'

import './Auth.css'
import './App.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const trimmedUsername = username.trim()
  const usernameIsValid = USERNAME_PATTERN.test(trimmedUsername)
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
    : touched.username && !usernameIsValid
      ? 'Use 3-20 characters: letters, numbers, and underscore'
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

  const isFormValid = usernameIsValid
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
      // Password spaces are allowed, so send the password exactly as typed.
      await register({
        username: trimmedUsername,
        email: trimmedEmail,
        password,
      })
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
              <Icon name="chess-knight" />
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
                <Alert>{serverError}</Alert>
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
                <Icon name="alert-circle" />
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
                <Icon name="alert-circle" />
                <span>{emailError}</span>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="register-password">Password</label>
              <div className="input-wrap">
                <input
                  className={`input ${passwordError ? 'error' : ''}`}
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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
                <button
                  className="input-icon-btn"
                  type="button"
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} />
                </button>
              </div>
              <div
                className="policy-box"
                id="register-password-policy"
                aria-label="Password requirements"
              >
                <span className={`policy-rule ${passwordPolicy.minLength ? 'ok' : ''}`}>
                  <Icon name={passwordPolicy.minLength ? 'check' : 'circle'} />
                  At least 8 characters
                </span>
                <span className={`policy-rule ${passwordPolicy.uppercase ? 'ok' : ''}`}>
                  <Icon name={passwordPolicy.uppercase ? 'check' : 'circle'} />
                  One uppercase letter
                </span>
                <span className={`policy-rule ${passwordPolicy.number ? 'ok' : ''}`}>
                  <Icon name={passwordPolicy.number ? 'check' : 'circle'} />
                  One number
                </span>
                <span className={`policy-rule ${passwordPolicy.specialCharacter ? 'ok' : ''}`}>
                  <Icon name={passwordPolicy.specialCharacter ? 'check' : 'circle'} />
                  One special character
                </span>
              </div>
              <div
                className={`field-error ${passwordError ? 'visible' : ''}`}
                id="register-password-error"
              >
                <Icon name="alert-circle" />
                <span>{passwordError}</span>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="register-confirm-password">
                Confirm Password
              </label>
              <div className="input-wrap">
                <input
                  className={`input ${confirmPasswordError ? 'error' : ''}`}
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
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
                <button
                  className="input-icon-btn"
                  type="button"
                  onClick={() => setShowConfirmPassword((currentValue) => !currentValue)}
                  aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                  title={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                >
                  <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} />
                </button>
              </div>
              <div
                className={`field-error ${confirmPasswordError ? 'visible' : ''}`}
                id="register-confirm-password-error"
              >
                <Icon name="alert-circle" />
                <span>{confirmPasswordError}</span>
              </div>
            </div>

            <Button
              disabled={isLoading}
              fullWidth
              icon={!isLoading ? 'arrow-right' : undefined}
              iconPosition="right"
              type="submit"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <footer className="auth-footer">
            <span>Already have an account?</span>
            <Link className="auth-link" to="/login">Sign in</Link>
          </footer>

          <LegalFooter />
        </div>
      </section>
    </main>
  )
}

export default Register

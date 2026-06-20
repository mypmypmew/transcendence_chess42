import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import ThemeToggle from '../components/ThemeToggle.jsx'

import './Auth.css'
import './App.css'

const MOCK_FAILED_EMAIL = 'fail@test.com'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [loginError, setLoginError] = useState('')

  const trimmedEmail = email.trim()
  const trimmedPassword = password.trim()
  const shouldShowEmailError = touched.email && trimmedEmail === ''
  const shouldShowPasswordError = touched.password && trimmedPassword === ''
  const passwordType = showPassword ? 'text' : 'password'
  const passwordIcon = showPassword ? 'ti ti-eye-off' : 'ti ti-eye'
  const passwordLabel = showPassword ? 'Hide password' : 'Show password'

  function handleSubmit(event) {
    event.preventDefault()

    setTouched({ email: true, password: true })
    setLoginError('')

    if (trimmedEmail === '' || trimmedPassword === '') {
      return
    }

    if (trimmedEmail.toLowerCase() === MOCK_FAILED_EMAIL) {
      setLoginError('Invalid email or password')
      return
    }

    navigate('/dashboard')
  }

  function handleBlur(fieldName) {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [fieldName]: true,
    }))
  }

  function handleEmailChange(event) {
    setEmail(event.target.value)

    if (loginError) {
      setLoginError('')
    }
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value)

    if (loginError) {
      setLoginError('')
    }
  }

  function togglePasswordVisibility() {
    setShowPassword((currentValue) => !currentValue)
  }

  return (
    <main className="auth-scene fade-in">
      <section className="auth-panel" aria-labelledby="login-title">
        <div className="auth-card">
          <header className="auth-card-intro">
            <ThemeToggle />

            <div className="auth-mark" aria-hidden="true">
              <i className="ti ti-crown" />
            </div>
            <p className="auth-kicker">Welcome back</p>
            <h1 className="auth-title" id="login-title">Continue your next move</h1>
            <p className="auth-subtitle">
              Sign in to return to your games, profile, and progress
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-error-slot" aria-live="polite">
              {loginError && (
                <div className="alert alert-error visible" role="alert">
                  <i className="ti ti-alert-circle" aria-hidden="true" />
                  <span>{loginError}</span>
                </div>
              )}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="login-email">Email</label>
              <div className="input-wrap">
                <input
                  className={`input ${shouldShowEmailError ? 'error' : ''}`}
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="Email address"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email')}
                  aria-invalid={shouldShowEmailError}
                  aria-describedby={shouldShowEmailError ? 'login-email-error' : undefined}
                />
                <span className="input-icon-btn" aria-hidden="true">
                  <i className="ti ti-mail" />
                </span>
              </div>
              <div className={`field-error ${shouldShowEmailError ? 'visible' : ''}`} id="login-email-error">
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>Email is required</span>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="login-password">Password</label>
              <div className="input-wrap">
                <input
                  className={`input ${shouldShowPasswordError ? 'error' : ''}`}
                  id="login-password"
                  name="password"
                  type={passwordType}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  aria-invalid={shouldShowPasswordError}
                  aria-describedby={shouldShowPasswordError ? 'login-password-error' : undefined}
                />
                <button
                  className="input-icon-btn"
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label={passwordLabel}
                  title={passwordLabel}
                >
                  <i className={passwordIcon} aria-hidden="true" />
                </button>
              </div>
              <div className={`field-error ${shouldShowPasswordError ? 'visible' : ''}`} id="login-password-error">
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>Password is required</span>
              </div>
            </div>

            <button className="btn btn-primary btn-full" type="submit">
              Sign in
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </button>
          </form>

          <footer className="auth-footer">
            <span>New here?</span>
            <Link className="auth-link" to="/register">Sign up</Link>
          </footer>
        </div>
      </section>
    </main>
  )
}

export default Login

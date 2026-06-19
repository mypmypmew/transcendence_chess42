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
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [loginError, setLoginError] = useState('')

  const emailError = touched.email && email.trim() === ''
  const passwordError = touched.password && password.trim() === ''
  const passwordType = showPassword ? 'text' : 'password'
  const passwordIcon = showPassword ? 'ti ti-eye-off' : 'ti ti-eye'
  const passwordLabel = showPassword ? 'Hide password' : 'Show password'

  function handleSubmit(event) {
    event.preventDefault()

    setTouched({ email: true, password: true })
    setLoginError('')

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

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

  function togglePasswordVisibility() {
    setShowPassword((currentValue) => !currentValue)
  }

  return (
    <main className="auth-scene fade-in">
      <ThemeToggle className="auth-theme-toggle" />
      <section className="auth-panel" aria-labelledby="login-title">
        <div className="auth-visual" aria-hidden="true">
          <div className="auth-visual-content">
            <p className="auth-visual-kicker">Scenic Chess System</p>
            <h2 className="auth-visual-title">Play. Learn. Improve.</h2>
            <p className="auth-visual-text">
              A focused chess space with warm gold accents, cinematic depth, and clear everyday navigation.
            </p>
          </div>
        </div>

        <div className="auth-card">
          <header className="auth-header">
            <div className="auth-mark" aria-hidden="true">
              <i className="ti ti-crown" />
            </div>
            <h1 className="auth-title" id="login-title">ChessMate</h1>
            <p className="auth-subtitle">Play. Learn. Improve.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-error-slot" aria-live="polite">
              <div className={`alert alert-error ${loginError ? 'visible' : ''}`} role="alert">
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>{loginError}</span>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="login-email">Email</label>
              <div className="input-wrap">
                <input
                  className={`input ${emailError ? 'error' : ''}`}
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => handleBlur('email')}
                  aria-invalid={emailError}
                  aria-describedby={emailError ? 'login-email-error' : undefined}
                />
                <span className="input-icon-btn" aria-hidden="true">
                  <i className="ti ti-mail" />
                </span>
              </div>
              <div className={`field-error ${emailError ? 'visible' : ''}`} id="login-email-error">
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>Email is required</span>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="login-password">Password</label>
              <div className="input-wrap">
                <input
                  className={`input ${passwordError ? 'error' : ''}`}
                  id="login-password"
                  name="password"
                  type={passwordType}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onBlur={() => handleBlur('password')}
                  aria-invalid={passwordError}
                  aria-describedby={passwordError ? 'login-password-error' : undefined}
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
              <div className={`field-error ${passwordError ? 'visible' : ''}`} id="login-password-error">
                <i className="ti ti-alert-circle" aria-hidden="true" />
                <span>Password is required</span>
              </div>
            </div>

            <div className="auth-options">
              <label className="auth-check">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a className="auth-link" href="#forgot-password">Forgot password?</a>
            </div>

            <button className="btn btn-primary btn-full" type="submit">
              Sign in
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </button>
          </form>

          <div className="auth-divider">or continue with</div>
          <div className="auth-social-row" aria-label="Mock social sign in options">
            <button className="btn btn-ghost" type="button" aria-label="Continue with Google">
              <i className="ti ti-brand-google" aria-hidden="true" />
            </button>
            <button className="btn btn-ghost" type="button" aria-label="Continue with Apple">
              <i className="ti ti-brand-apple" aria-hidden="true" />
            </button>
            <button className="btn btn-ghost" type="button" aria-label="Continue with Discord">
              <i className="ti ti-brand-discord" aria-hidden="true" />
            </button>
          </div>

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

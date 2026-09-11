import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import LegalFooter from '../components/LegalFooter.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import {
  Alert,
  Button,
  FormField,
  Icon,
  Input,
  InputIconButton,
} from '../components/ui.jsx'
import { useAuth } from '../context/AuthContext.jsx'

import './Auth.css'
import './App.css'


function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
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

  async function handleSubmit(event) {
    event.preventDefault()

    setTouched({ email: true, password: true })
    setLoginError('')

    if (trimmedEmail === '' || trimmedPassword === '') {
      return
    }

    setIsLoading(true)

    try {
      // Password spaces are allowed, so send the password exactly as typed.
      await login({ email: trimmedEmail, password })
      navigate('/dashboard')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
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
              <Icon name="crown" />
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
                <Alert>{loginError}</Alert>
              )}
            </div>

            <FormField
              error={shouldShowEmailError ? 'Email is required' : ''}
              errorId="login-email-error"
              label="Email"
              labelFor="login-email"
            >
              <div className="input-wrap">
                <Input
                  hasError={shouldShowEmailError}
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
                <InputIconButton decorative icon="mail" />
              </div>
            </FormField>

            <FormField
              error={shouldShowPasswordError ? 'Password is required' : ''}
              errorId="login-password-error"
              label="Password"
              labelFor="login-password"
            >
              <div className="input-wrap">
                <Input
                  hasError={shouldShowPasswordError}
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
                <InputIconButton
                  aria-label={passwordLabel}
                  icon={passwordIcon}
                  title={passwordLabel}
                  onClick={togglePasswordVisibility}
                />
              </div>
            </FormField>

            <Button
              disabled={isLoading}
              fullWidth
              icon={!isLoading ? 'arrow-right' : undefined}
              iconPosition="right"
              type="submit"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <footer className="auth-footer">
            <span>New here?</span>
            <Link className="auth-link" to="/register">Sign up</Link>
          </footer>

          <LegalFooter />
        </div>
      </section>
    </main>
  )
}

export default Login

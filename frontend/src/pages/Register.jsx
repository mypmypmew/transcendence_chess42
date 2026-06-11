import { useState, useRef } from 'react'
import styles from './Register.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOCK_TAKEN = ['test@test.com', 'admin']

const rules = {
  len:     pw => pw.length >= 8,
  upper:   pw => /[A-Z]/.test(pw),
  digit:   pw => /[0-9]/.test(pw),
  special: pw => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
}

function mockApiCall(email, login) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (MOCK_TAKEN.includes(email) || MOCK_TAKEN.includes(login)) {
        reject(new Error('Email or username is already taken'))
      } else {
        resolve({ ok: true })
      }
    }, 1600)
  })
}

export default function Register() {
  const [email, setEmail]       = useState('')
  const [login, setLogin]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')

  const [showPw1, setShowPw1] = useState(false)
  const [showPw2, setShowPw2] = useState(false)

  const [errors, setErrors]         = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)

  // Password policy checks
  const policy = {
    len:     rules.len(password),
    upper:   rules.upper(password),
    digit:   rules.digit(password),
    special: rules.special(password),
  }
  const policyOk = Object.values(policy).every(Boolean)

  function validate() {
    const e = {}
    if (!email)                  e.email    = 'Email is required'
    else if (!EMAIL_RE.test(email)) e.email = 'Invalid email format'
    if (!login)                  e.login    = 'Username is required'
    if (!password)               e.password = 'Password is required'
    else if (!policyOk)          e.password = 'Password does not meet requirements'
    if (!confirm)                e.confirm  = 'Please confirm your password'
    else if (password !== confirm) e.confirm = 'Passwords do not match'
    return e
  }

  async function handleSubmit() {
    setServerError('')
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      await mockApiCall(email, login)
      setSuccess(true)
      setTimeout(() => {
        // Replace with: navigate('/lobby')
        window.location.href = '/lobby'
      }, 2200)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleConfirmChange(val) {
    setConfirm(val)
    if (errors.confirm) setErrors(e => ({ ...e, confirm: undefined }))
  }

  if (success) {
    return (
      <div className={styles.shell}>
        <div className={styles.card}>
          <div className={styles.successOverlay}>
            <div className={styles.successIcon}>♛</div>
            <div className={styles.successTitle}>Welcome aboard!</div>
            <div className={styles.successSub}>
              Your account is ready. Redirecting you to the lobby…
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.shell}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logoRow}>
          <span className={styles.chessIcon}>♟</span>
          <span className={styles.brand}>ChessMate</span>
        </div>

        <h2 className={styles.heading}>Create an account</h2>
        <p className={styles.subheading}>Join the game — make your first move</p>

        {/* Server error */}
        {serverError && (
          <div className={styles.serverError}>
            <i className="ti ti-alert-circle" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Email */}
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <div className={styles.inputWrap}>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={errors.email ? styles.hasError : email && !errors.email ? styles.isValid : ''}
            />
          </div>
          {errors.email && (
            <div className={styles.fieldError}>
              <i className="ti ti-info-circle" /> {errors.email}
            </div>
          )}
        </div>

        {/* Username */}
        <div className={styles.field}>
          <label htmlFor="login">Username</label>
          <div className={styles.inputWrap}>
            <input
              id="login"
              type="text"
              placeholder="grand_master_42"
              autoComplete="username"
              value={login}
              onChange={e => setLogin(e.target.value)}
              className={errors.login ? styles.hasError : login && !errors.login ? styles.isValid : ''}
            />
          </div>
          {errors.login && (
            <div className={styles.fieldError}>
              <i className="ti ti-info-circle" /> {errors.login}
            </div>
          )}
        </div>

        {/* Password */}
        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <div className={styles.inputWrap}>
            <input
              id="password"
              type={showPw1 ? 'text' : 'password'}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={errors.password ? styles.hasError : ''}
            />
            <button
              type="button"
              className={styles.togglePw}
              onClick={() => setShowPw1(v => !v)}
              aria-label="Toggle password visibility"
            >
              <i className={showPw1 ? 'ti ti-eye-off' : 'ti ti-eye'} />
            </button>
          </div>

          {/* Policy box */}
          <div className={styles.policyBox}>
            {[
              { key: 'len',     label: '8+ characters' },
              { key: 'upper',   label: 'Uppercase letter' },
              { key: 'digit',   label: 'Number' },
              { key: 'special', label: 'Special char (!@#…)' },
            ].map(r => (
              <div key={r.key} className={`${styles.policyRule} ${policy[r.key] ? styles.ok : ''}`}>
                <i className="ti ti-circle-check" /> {r.label}
              </div>
            ))}
          </div>

          {errors.password && (
            <div className={styles.fieldError}>
              <i className="ti ti-info-circle" /> {errors.password}
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className={styles.field}>
          <label htmlFor="confirm">Confirm password</label>
          <div className={styles.inputWrap}>
            <input
              id="confirm"
              type={showPw2 ? 'text' : 'password'}
              placeholder="Repeat your password"
              autoComplete="new-password"
              value={confirm}
              onChange={e => handleConfirmChange(e.target.value)}
              className={errors.confirm ? styles.hasError : confirm && !errors.confirm ? styles.isValid : ''}
            />
            <button
              type="button"
              className={styles.togglePw}
              onClick={() => setShowPw2(v => !v)}
              aria-label="Toggle password visibility"
            >
              <i className={showPw2 ? 'ti ti-eye-off' : 'ti ti-eye'} />
            </button>
          </div>
          {errors.confirm && (
            <div className={styles.fieldError}>
              <i className="ti ti-info-circle" /> {errors.confirm}
            </div>
          )}
        </div>

        <hr className={styles.divider} />

        <button
          type="button"
          className={styles.btnSubmit}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading && <span className={styles.spinner} />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className={styles.signinHint}>
          Already have an account?{' '}
          <a href="/login">Sign in</a>
        </p>

      </div>
    </div>
  )
}

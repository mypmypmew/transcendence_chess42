import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '../api/authApi.js'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      setIsAuthLoading(true)
      setAuthError(null)

      try {
        const data = await getCurrentUser()

        if (isMounted) {
          setUser(data.user)
        }
      } catch (error) {
        if (!isMounted) {
          return
        }

        setUser(null)

        if (error.status !== 401) {
          setAuthError(error.message)
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const register = useCallback(async ({ username, email, password }) => {
    const data = await registerRequest({ username, email, password })
    setUser(data.user)
    setAuthError(null)
    return data.user
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const data = await loginRequest({ email, password })
    setUser(data.user)
    setAuthError(null)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setUser(null)
    setAuthError(null)
  }, [])

  const value = useMemo(() => ({
    user,
    isAuthLoading,
    isAuthenticated: Boolean(user),
    authError,
    register,
    login,
    logout,
  }), [user, isAuthLoading, authError, register, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

// Allows exporting the provider and its hook from this file despite React Fast Refresh lint rules.
// Same temporary pattern as ThemeContext.
// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth }

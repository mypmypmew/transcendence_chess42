import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const THEME_STORAGE_KEY = 'chessmate-theme'
const DEFAULT_THEME = 'dark'

const ThemeContext = createContext(null)

function getStoredTheme() {
  if (typeof window === 'undefined') {
	return DEFAULT_THEME
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (savedTheme === 'light' || savedTheme === 'dark') {
	return savedTheme
  }

  return DEFAULT_THEME
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme)

  useEffect(() => {
	document.documentElement.dataset.theme = theme
	document.documentElement.style.colorScheme = theme
	window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
	setTheme((currentTheme) => {
	  if (currentTheme === 'dark') {
		return 'light'
	  }

	  return 'dark'
	})
  }

  const value = useMemo(() => ({
	theme,
	isLightTheme: theme === 'light',
	toggleTheme,
	setTheme,
  }), [theme])

  return (
	<ThemeContext.Provider value={value}>
	  {children}
	</ThemeContext.Provider>
  )
}

function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
	throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}

export { ThemeProvider, useTheme }

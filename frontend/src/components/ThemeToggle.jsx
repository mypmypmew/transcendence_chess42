import { useTheme } from '../context/ThemeContext.jsx'

function ThemeToggle({ className = '' }) {
  const { theme, isLightTheme, toggleTheme } = useTheme()
  const iconClass = isLightTheme ? 'ti ti-sun' : 'ti ti-moon'
  const nextThemeLabel = isLightTheme ? 'dark' : 'light'
  const label = `Switch to ${nextThemeLabel} theme`
  const classes = `btn btn-ghost theme-toggle ${className}`.trim()

  return (
	<button
	  className={classes}
	  type="button"
	  onClick={toggleTheme}
	  aria-label={label}
	  title={label}
	>
	  <i className={iconClass} aria-hidden="true" />
	  <span>{theme}</span>
	</button>
  )
}

export default ThemeToggle

import { useTheme } from '../context/ThemeContext.jsx'
import { Button } from './ui.jsx'

function ThemeToggle({ className = '' }) {
  const { theme, isLightTheme, toggleTheme } = useTheme()
  const icon = isLightTheme ? 'sun' : 'moon'
  const nextThemeLabel = isLightTheme ? 'dark' : 'light'
  const label = `Switch to ${nextThemeLabel} theme`

  return (
	<Button
	  className={`theme-toggle ${className}`.trim()}
	  icon={icon}
	  type="button"
	  onClick={toggleTheme}
	  aria-label={label}
	  title={label}
	  variant="ghost"
	>
	  <span>{theme}</span>
	</Button>
  )
}

export default ThemeToggle

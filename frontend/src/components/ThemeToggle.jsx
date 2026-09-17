import { useTheme } from '../context/ThemeContext.jsx'
import { Icon } from './ui.jsx'

function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useTheme()

  return (
    <div className={`theme-toggle ${className}`.trim()} role="group" aria-label="Theme">
      <button
        className={theme === 'dark' ? 'theme-toggle-option active' : 'theme-toggle-option'}
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        aria-label="Use dark theme"
        title="Dark theme"
      >
        <Icon name="moon" />
      </button>
      <button
        className={theme === 'light' ? 'theme-toggle-option active' : 'theme-toggle-option'}
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        aria-label="Use light theme"
        title="Light theme"
      >
        <Icon name="sun" />
      </button>
    </div>
  )
}

export default ThemeToggle

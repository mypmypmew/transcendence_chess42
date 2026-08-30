// Small custom UI kit for shared ChessMate interface primitives.

const designTokens = {
  colors: {
    dark: {
      background: '#0f172a',
      surface: '#142336',
      elevated: '#0b1624',
      accent: '#d4a037',
      accentHover: '#ffbd59',
      textPrimary: '#f7f9ff',
      textSecondary: '#dfe5f0',
      textMuted: '#aab6c7',
      success: '#6cc56f',
      danger: '#ff7b7b',
      border: 'rgba(148, 163, 184, 0.22)',
    },
    light: {
      background: '#f5f2eb',
      surface: '#fffaf0',
      elevated: '#ffffff',
      accent: '#9f6b21',
      accentHover: '#b87a24',
      textPrimary: '#17202a',
      textSecondary: '#405063',
      textMuted: '#738196',
      success: '#2f7d48',
      danger: '#b24545',
      border: 'rgba(88, 103, 124, 0.22)',
    },
  },
  typography: {
    ui: "'Inter', system-ui, sans-serif",
    display: "'Cormorant Garant', Georgia, serif",
    mono: 'ui-monospace, Consolas, monospace',
    scale: {
      xs: '11px',
      sm: '12px',
      base: '13px',
      md: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '22px',
      '3xl': '26px',
    },
  },
  radii: {
    sm: '4px',
    md: '6px',
    lg: '10px',
    xl: '12px',
    pill: '999px',
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
  },
  icons: {
    alert: 'alert-circle',
    close: 'x',
    crown: 'crown',
    dashboard: 'layout-dashboard',
    game: 'chess-rook',
    messages: 'messages',
    profile: 'user-circle',
    trophy: 'trophy',
  },
}

const tablerPrefix = 'ti ti-'

export function DesignSystemMeta() {
  return null
}

DesignSystemMeta.tokens = designTokens

export function Icon({ name, className = '', decorative = true, label, ...props }) {
  const iconName = name?.startsWith('ti ti-') ? name : `${tablerPrefix}${name}`
  const classes = [iconName, className].filter(Boolean).join(' ')

  return (
    <i
      className={classes}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={!decorative ? label : undefined}
      role={!decorative && label ? 'img' : undefined}
      {...props}
    />
  )
}

export function Button({
  as: Component = 'button',
  children,
  className = '',
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  size,
  type,
  variant = 'primary',
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size ? `btn-${size}` : '',
    fullWidth ? 'btn-full' : '',
    className,
  ].filter(Boolean).join(' ')
  const buttonType = Component === 'button' ? (type || 'button') : type
  const iconNode = icon ? <Icon name={icon} /> : null
  const componentProps = { ...props }

  if (Component === 'button') {
    componentProps.disabled = disabled
  }

  return (
    <Component className={classes} type={buttonType} {...componentProps}>
      {iconPosition === 'left' && iconNode}
      {children}
      {iconPosition === 'right' && iconNode}
    </Component>
  )
}

export function IconButton({
  'aria-label': ariaLabel,
  className = '',
  icon,
  title = ariaLabel,
  variant = 'ghost',
  ...props
}) {
  return (
    <Button
      aria-label={ariaLabel}
      className={className}
      icon={icon}
      size="icon"
      title={title}
      variant={variant}
      {...props}
    />
  )
}

export function Input({ className = '', hasError = false, isValid = false, ...props }) {
  const classes = [
    'input',
    hasError ? 'error' : '',
    isValid ? 'valid' : '',
    className,
  ].filter(Boolean).join(' ')

  return <input className={classes} {...props} />
}

export function InputIconButton({
  'aria-label': ariaLabel,
  className = '',
  decorative = false,
  icon,
  title = ariaLabel,
  ...props
}) {
  if (decorative) {
    return (
      <span className={['input-icon-btn', className].filter(Boolean).join(' ')} aria-hidden="true">
        <Icon name={icon} />
      </span>
    )
  }

  return (
    <button
      aria-label={ariaLabel}
      className={['input-icon-btn', className].filter(Boolean).join(' ')}
      title={title}
      type="button"
      {...props}
    >
      <Icon name={icon} />
    </button>
  )
}

export function FormField({
  children,
  className = '',
  error,
  errorId,
  label,
  labelFor,
  ...props
}) {
  return (
    <div className={['field', className].filter(Boolean).join(' ')} {...props}>
      {label && (
        <label className="field-label" htmlFor={labelFor}>
          {label}
        </label>
      )}
      {children}
      <div className={['field-error', error ? 'visible' : ''].filter(Boolean).join(' ')} id={errorId}>
        {error && (
          <>
            <Icon name="alert-circle" />
            <span>{error}</span>
          </>
        )}
      </div>
    </div>
  )
}

export function Badge({ children, className = '', variant = 'accent', ...props }) {
  const classes = ['badge', `badge-${variant}`, className].filter(Boolean).join(' ')

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}

export function Alert({
  children,
  className = '',
  icon = 'alert-circle',
  isVisible = true,
  role = 'alert',
  variant = 'error',
  ...props
}) {
  const classes = ['alert', `alert-${variant}`, isVisible ? 'visible' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} role={role} {...props}>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </div>
  )
}

export function EmptyState({ children, className = '', icon, subtitle, title, ...props }) {
  return (
    <div className={['empty-state', className].filter(Boolean).join(' ')} {...props}>
      {icon && <Icon className="empty-icon" name={icon} />}
      {title && <p className="empty-title">{title}</p>}
      {subtitle && <p className="empty-sub">{subtitle}</p>}
      {children}
    </div>
  )
}

export function StatusDot({ className = '', size, status = 'offline', ...props }) {
  const classes = ['status-dot', size, status, className].filter(Boolean).join(' ')

  return <span className={classes} aria-hidden="true" {...props} />
}

export function Panel({ as: Component = 'section', children, className = '', ...props }) {
  return (
    <Component className={['cm-panel', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </Component>
  )
}

export function PanelHeader({ action, children, className = '', eyebrow, title, titleId, ...props }) {
  return (
    <div className={['cm-panel-header', className].filter(Boolean).join(' ')} {...props}>
      <div>
        {eyebrow && <p className="label">{eyebrow}</p>}
        {title && <h2 className="cm-section-title" id={titleId}>{title}</h2>}
        {children}
      </div>
      {action}
    </div>
  )
}

export function PanelBody({ as: Component = 'div', children, className = '', ...props }) {
  return (
    <Component className={['cm-panel-body', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </Component>
  )
}

export function Toolbar({ children, className = '', ...props }) {
  return (
    <div className={['cm-toolbar', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
}

export function ActionCard({ as: Component = 'a', children, className = '', ...props }) {
  return (
    <Component className={['cm-action-card', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </Component>
  )
}

export function StatCell({ label, value, ...props }) {
  return (
    <div className="stat-cell" {...props}>
      <div className="stat-num">{value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  )
}

export function ListRow({ as: Component = 'div', children, className = '', ...props }) {
  return (
    <Component className={['cm-list-row', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </Component>
  )
}

export function Tabs({ children, className = '', ...props }) {
  return (
    <div className={['cm-tabs', className].filter(Boolean).join(' ')} role="tablist" {...props}>
      {children}
    </div>
  )
}

export function Tab({ active = false, children, className = '', ...props }) {
  return (
    <button
      aria-selected={active}
      className={['cm-tab', active ? 'active' : '', className].filter(Boolean).join(' ')}
      role="tab"
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

export function Table({ children, className = '', ...props }) {
  return (
    <table className={['cm-table', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </table>
  )
}

export function MessageBubble({ children, isMine = false, ...props }) {
  return (
    <div className={isMine ? 'cm-message mine' : 'cm-message'} {...props}>
      {children}
    </div>
  )
}

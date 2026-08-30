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
    },
  },
  typography: {
    ui: "'Inter', system-ui, sans-serif",
    display: "'Cormorant Garant', Georgia, serif",
    mono: 'ui-monospace, Consolas, monospace',
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

  return (
    <Component className={classes} disabled={disabled} type={buttonType} {...props}>
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

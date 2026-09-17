import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import {
  IconButton,
  Panel,
  PanelHeader,
} from './ui.jsx'
import './Modal.css'

function Modal({
  actions,
  children,
  className = '',
  contentClassName = '',
  description,
  header,
  onClose,
  size = 'default',
  title,
  titleId,
}) {
  const dialogRef = useRef(null)
  const generatedTitleId = useId()
  const headingId = titleId || generatedTitleId
  const sizeClass = size === 'sm' ? 'cm-modal__content--sm' : ''

  useEffect(() => {
    const dialog = dialogRef.current
    const opener = document.activeElement

    dialog.showModal()

    return () => {
      dialog.close()

      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus()
      }
    }
  }, [])

  function handleCancel(event) {
    event.preventDefault()
    onClose()
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      className={['cm-modal', className].filter(Boolean).join(' ')}
      onCancel={handleCancel}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        aria-label="Close modal"
        className="cm-modal__backdrop"
        tabIndex={-1}
        type="button"
        onClick={onClose}
      />

      <Panel as="div" className={['cm-modal__content', sizeClass, contentClassName].filter(Boolean).join(' ')}>
        {header || (
          <PanelHeader
            action={actions || <IconButton aria-label="Close modal" icon="x" onClick={onClose} />}
            title={title}
            titleId={headingId}
          >
            {description && <p className="cm-muted">{description}</p>}
          </PanelHeader>
        )}
        {children}
      </Panel>
    </dialog>,
    document.body,
  )
}

export default Modal

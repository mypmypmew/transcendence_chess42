import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import { chessGuideSections } from '../utils/chessGuide.js'
import {
	Button,
	IconButton,
	Panel,
	PanelBody,
	PanelHeader,
} from './ui.jsx'
import './Modal.css'

function ChessGuideModal({ onClose }) {
	const dialogRef = useRef(null)
	const titleId = useId()

	// Use the browser's modal behavior and restore focus to the opener.
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

	// Keep React state in sync when the browser handles Escape.
	function handleCancel(event) {
		event.preventDefault()
		event.stopPropagation()
		onClose()
	}

	// Render outside the page layout so its transforms cannot clip the guide.
	return createPortal(
		<dialog
			ref={dialogRef}
			className="cm-modal"
			aria-labelledby={titleId}
			onCancel={handleCancel}
			onKeyDown={(event) => event.stopPropagation()}
			style={{
				width: '100%',
				height: '100%',
				maxWidth: 'none',
				maxHeight: 'none',
				margin: 0,
				border: 0,
				background: 'transparent',
				color: 'inherit',
			}}
		>
			<button
				className="cm-modal__backdrop"
				type="button"
				tabIndex={-1}
				aria-label="Close chess guide"
				onClick={onClose}
			/>

			<Panel as="div" className="cm-modal__content cm-modal__content--sm">
				<PanelHeader
					title="Chess guide"
					titleId={titleId}
					action={(
						<IconButton icon="x" aria-label="Close chess guide" onClick={onClose}/>
					)}
				>
					<p className="cm-muted">
						A quick reference to chess rules. Opening this guide does not pause a game.
					</p>
				</PanelHeader>

				<PanelBody className="flex flex-col gap-5">
					{/* Present the shared rules without extra cards or interactive lessons. */}
					{chessGuideSections.map((section) => (
						<section key={section.id} aria-labelledby={`${titleId}-${section.id}`} className="flex flex-col gap-3">
							<h3 id={`${titleId}-${section.id}`} className="cm-section-title">
								{section.title}
							</h3>

							<dl className="flex flex-col gap-3">
								{section.items.map((item) => (
									<div key={item.title}>
										<dt className="stat-num text-primary">
											{item.title}
										</dt>
										<dd className="cm-muted">{item.text}</dd>
									</div>
								))}
							</dl>
						</section>
					))}

					<div className="flex justify-center">
						<Button type="button" onClick={onClose}>
							Close guide
						</Button>
					</div>
				</PanelBody>
			</Panel>
		</dialog>,
		document.body,
	)
}

export default ChessGuideModal

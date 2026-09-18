import { chessGuideSections } from '../utils/chessGuide.js'
import {
  Button,
  Icon,
  IconButton,
  PanelBody,
} from './ui.jsx'
import Modal from './Modal.jsx'

function ChessGuideModal({ onClose }) {
  return (
    <Modal
      actions={<IconButton icon="x" aria-label="Close chess guide" onClick={onClose} />}
      description="A quick reference to chess rules. Opening this guide does not pause a game."
      onClose={onClose}
      size="sm"
      title="Chess guide"
    >
        <PanelBody className="flex flex-col gap-5">
          {chessGuideSections.map((section) => (
            <details key={section.id} className="cm-guide-section">
              <summary className="cm-guide-summary flex items-center justify-between gap-3">
                <h3 className="cm-section-title min-w-0">{section.title}</h3>
              </summary>

              <dl className="flex flex-col gap-3">
                {section.items.map((item) => (
                  <div key={item.title}>
                    <dt className="stat-num text-primary flex items-center gap-2">
                      {item.icon && (
                        <Icon name={item.icon} className="cm-guide-icon flex-shrink-0" />
                      )}
                      <span>{item.title}</span>
                    </dt>
                    <dd className="cm-muted">{item.text}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ))}

          <div className="flex justify-center">
            <Button type="button" onClick={onClose}>
              Close guide
            </Button>
          </div>
        </PanelBody>
    </Modal>
  )
}

export default ChessGuideModal

import { Link } from 'react-router-dom'

function LegalFooter() {
  return (
    <footer className="cm-footer" aria-label="Legal information">
      <Link to="/terms-of-service">Terms of Service</Link>
      <Link to="/privacy-policy">Privacy Policy</Link>
    </footer>
  )
}

export default LegalFooter

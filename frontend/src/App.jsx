import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Register    from './pages/Register'
// import Profile     from './pages/Profile'
// import Leaderboard from './pages/Leaderboard'
// import Chat        from './pages/Chat'

// ----------------------------------------------------------------
// Placeholder — remove once pages are created
// ----------------------------------------------------------------
// import { useState, useEffect } from 'react'
// function App() {
//   const [health, setHealth] = useState('loading...')
//   useEffect(() => {
//     fetch('/api/health')
//       .then((res) => res.json())
//       .then((data) => setHealth(data.status))
//       .catch(() => setHealth('connection error'))
//   }, [])
//   return (
//     <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
//       <h1>Chess Project</h1>
//       <p>Backend status: <strong>{health}</strong></p>
//     </div>
//   )
// }
// ----------------------------------------------------------------

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route → registration */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        <Route path="/register" element={<Register />} />
        {/* <Route path="/profile" element={<Profile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/chat" element={<Chat />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App

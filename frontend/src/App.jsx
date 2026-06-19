import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ThemeProvider } from './context/ThemeContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
// import Profile from './pages/Profile.jsx'
// import Dashboard from './pages/Dashboard.jsx'
// import Game from './pages/Game.jsx'
// import Leaderboard from './pages/Leaderboard.jsx'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
		  {/* <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} /> */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

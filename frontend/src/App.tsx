import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { RootState } from './store'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import DeckPage from './pages/DeckPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import Layout from './components/Layout'

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} 
        />

        {/* Protected routes */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Layout><HomePage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/game" 
          element={isAuthenticated ? <Layout><GamePage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/decks" 
          element={isAuthenticated ? <Layout><DeckPage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <Layout><ProfilePage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/leaderboard" 
          element={isAuthenticated ? <Layout><LeaderboardPage /></Layout> : <Navigate to="/login" replace />} 
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App

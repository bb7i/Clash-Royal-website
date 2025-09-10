import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store'
import { startSearching } from '../store/slices/gameSlice'
import { matchmakingAPI } from '../utils/api'
import toast from 'react-hot-toast'

const HomePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const { isSearching } = useSelector((state: RootState) => state.game)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleStartBattle = async () => {
    try {
      dispatch(startSearching())
      await matchmakingAPI.startSearch()
      navigate('/game')
    } catch (error: any) {
      toast.error(error || 'Failed to start battle')
    }
  }

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="welcome-section">
          <h1>Welcome, {user?.username}!</h1>
          <p>Ready for battle? Choose your deck and start fighting!</p>
        </div>
        
        <div className="action-cards">
          <div className="action-card">
            <div className="card-icon">⚔️</div>
            <h3>Battle</h3>
            <p>Start a new battle and climb the leaderboard</p>
            <button 
              className="btn btn-primary"
              onClick={handleStartBattle}
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Start Battle'}
            </button>
          </div>
          
          <div className="action-card">
            <div className="card-icon">🃏</div>
            <h3>Decks</h3>
            <p>Build and manage your card decks</p>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/decks')}
            >
              Manage Decks
            </button>
          </div>
          
          <div className="action-card">
            <div className="card-icon">🏆</div>
            <h3>Leaderboard</h3>
            <p>See how you rank against other players</p>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/leaderboard')}
            >
              View Rankings
            </button>
          </div>
        </div>
        
        <div className="stats-section">
          <h2>Your Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{user?.trophies || 0}</div>
              <div className="stat-label">Trophies</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user?.level || 1}</div>
              <div className="stat-label">Level</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user?.gems || 0}</div>
              <div className="stat-label">Gems</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user?.gold || 0}</div>
              <div className="stat-label">Gold</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage

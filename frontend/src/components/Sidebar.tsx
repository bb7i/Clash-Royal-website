import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth)

  const menuItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/game', label: 'Battle', icon: '⚔️' },
    { path: '/decks', label: 'Decks', icon: '🃏' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        {user && (
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">
                <span>{user.username.charAt(0).toUpperCase()}</span>
              </div>
              <div className="user-details">
                <div className="username">{user.username}</div>
                <div className="user-level">Level {user.level}</div>
                <div className="user-trophies">🏆 {user.trophies} trophies</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar

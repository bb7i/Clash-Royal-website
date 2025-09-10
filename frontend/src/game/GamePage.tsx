import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store'
import { 
  setCurrentMatch, 
  playCard, 
  addGameAction,
  endGame 
} from '../store/slices/gameSlice'
import { io, Socket } from 'socket.io-client'
import GameCanvas from './GameCanvas'
import { Card } from '../store/slices/gameSlice'

const GamePage: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentMatch, hand, elixir, maxElixir } = useSelector((state: RootState) => state.game)
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [gameTime, setGameTime] = useState(0)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('/socket.io', {
      auth: {
        token: localStorage.getItem('accessToken')
      }
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to game server')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from game server')
    })

    newSocket.on('match-found', (data) => {
      console.log('Match found:', data)
      dispatch(setCurrentMatch({
        id: data.matchId,
        player1: {
          id: user?.id || '',
          username: user?.username || '',
          trophies: user?.trophies || 0,
          elixir: 4,
          towerHealth: { king: 2400, princess1: 1400, princess2: 1400 }
        },
        player2: {
          id: data.opponent.id,
          username: data.opponent.username,
          trophies: data.opponent.trophies,
          elixir: 4,
          towerHealth: { king: 2400, princess1: 1400, princess2: 1400 }
        },
        gameTime: 0,
        status: 'active'
      }))
    })

    newSocket.on('game-state', (data) => {
      setGameState(data)
    })

    newSocket.on('game-update', (data) => {
      setGameState(data)
      setGameTime(data.gameTime || 0)
    })

    newSocket.on('game-action', (data) => {
      dispatch(addGameAction(data))
    })

    newSocket.on('game-ended', (data) => {
      dispatch(endGame({ winner: data.winner }))
      setTimeout(() => {
        navigate('/')
      }, 5000)
    })

    newSocket.on('error', (error) => {
      console.error('Game error:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [dispatch, navigate, user])

  useEffect(() => {
    if (socket && currentMatch) {
      // Join game room
      socket.emit('join-game', {
        matchId: currentMatch.id,
        userId: user?.id
      })
    }
  }, [socket, currentMatch, user])

  const handleCardPlay = (cardId: string, position: { x: number; y: number }) => {
    if (socket && currentMatch) {
      socket.emit('game-action', {
        matchId: currentMatch.id,
        actionType: 'play_card',
        actionData: { cardId, position }
      })
    }
  }

  const handleEmote = (emote: string) => {
    if (socket && currentMatch) {
      socket.emit('game-action', {
        matchId: currentMatch.id,
        actionType: 'emote',
        actionData: { emote }
      })
    }
  }

  const handleSurrender = () => {
    if (socket && currentMatch) {
      socket.emit('game-action', {
        matchId: currentMatch.id,
        actionType: 'surrender',
        actionData: {}
      })
    }
  }

  if (!currentMatch) {
    return (
      <div className="game-page">
        <div className="game-container">
          <h1>No Active Game</h1>
          <p>Please start a battle from the home page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="game-page">
      <div className="game-container">
        {/* Game Header */}
        <div className="game-header">
          <div className="player-info">
            <div className="player1">
              <span className="username">{currentMatch.player1.username}</span>
              <span className="trophies">🏆 {currentMatch.player1.trophies}</span>
            </div>
            <div className="vs">VS</div>
            <div className="player2">
              <span className="username">{currentMatch.player2.username}</span>
              <span className="trophies">🏆 {currentMatch.player2.trophies}</span>
            </div>
          </div>
          
          <div className="game-timer">
            {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
          </div>

          <div className="game-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => handleEmote('thumbs_up')}
            >
              👍
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => handleEmote('cry')}
            >
              😢
            </button>
            <button 
              className="btn btn-danger"
              onClick={handleSurrender}
            >
              Surrender
            </button>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="game-canvas-wrapper">
          <GameCanvas
            width={800}
            height={600}
            onCardPlay={handleCardPlay}
            hand={hand}
            elixir={elixir}
            maxElixir={maxElixir}
            gameState={gameState}
          />
        </div>

        {/* Connection Status */}
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>
    </div>
  )
}

export default GamePage

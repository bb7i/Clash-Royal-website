import React, { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'
import { GameEngine } from './GameEngine'
import { Card } from '../store/slices/gameSlice'

interface GameCanvasProps {
  width: number
  height: number
  onCardPlay: (cardId: string, position: { x: number; y: number }) => void
  hand: Card[]
  elixir: number
  maxElixir: number
  gameState: any
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  width,
  height,
  onCardPlay,
  hand,
  elixir,
  maxElixir,
  gameState
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedCard, setDraggedCard] = useState<Card | null>(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize PIXI application
    const app = new PIXI.Application({
      view: canvasRef.current,
      width,
      height,
      backgroundColor: 0x2C3E50,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    })

    appRef.current = app

    // Initialize game engine
    const gameEngine = new GameEngine(app, width, height)
    gameEngineRef.current = gameEngine

    // Setup event listeners
    setupEventListeners(app, gameEngine)

    return () => {
      app.destroy(true)
    }
  }, [width, height])

  useEffect(() => {
    if (gameEngineRef.current && gameState) {
      gameEngineRef.current.updateGameState(gameState)
    }
  }, [gameState])

  const setupEventListeners = (app: PIXI.Application, gameEngine: GameEngine) => {
    // Mouse/Touch events for card interaction
    app.stage.interactive = true
    app.stage.hitArea = new PIXI.Rectangle(0, 0, width, height)

    // Mouse down
    app.stage.on('pointerdown', (event) => {
      const position = event.data.global
      const card = getCardAtPosition(position)
      
      if (card && elixir >= card.elixirCost) {
        setIsDragging(true)
        setDraggedCard(card)
        setDragPosition(position)
      }
    })

    // Mouse move
    app.stage.on('pointermove', (event) => {
      if (isDragging && draggedCard) {
        const position = event.data.global
        setDragPosition(position)
        gameEngine.updateDragPreview(position, draggedCard)
      }
    })

    // Mouse up
    app.stage.on('pointerup', (event) => {
      if (isDragging && draggedCard) {
        const position = event.data.global
        
        // Check if position is valid for playing card
        if (isValidPlayPosition(position)) {
          onCardPlay(draggedCard.id, {
            x: position.x / width,
            y: position.y / height
          })
        }
        
        setIsDragging(false)
        setDraggedCard(null)
        gameEngine.clearDragPreview()
      }
    })

    // Touch events for mobile
    app.stage.on('touchstart', (event) => {
      const touch = event.data.originalEvent.touches[0]
      const position = { x: touch.clientX, y: touch.clientY }
      const card = getCardAtPosition(position)
      
      if (card && elixir >= card.elixirCost) {
        setIsDragging(true)
        setDraggedCard(card)
        setDragPosition(position)
      }
    })

    app.stage.on('touchmove', (event) => {
      if (isDragging && draggedCard) {
        const touch = event.data.originalEvent.touches[0]
        const position = { x: touch.clientX, y: touch.clientY }
        setDragPosition(position)
        gameEngine.updateDragPreview(position, draggedCard)
      }
    })

    app.stage.on('touchend', (event) => {
      if (isDragging && draggedCard) {
        const touch = event.data.originalEvent.changedTouches[0]
        const position = { x: touch.clientX, y: touch.clientY }
        
        if (isValidPlayPosition(position)) {
          onCardPlay(draggedCard.id, {
            x: position.x / width,
            y: position.y / height
          })
        }
        
        setIsDragging(false)
        setDraggedCard(null)
        gameEngine.clearDragPreview()
      }
    })
  }

  const getCardAtPosition = (position: { x: number; y: number }): Card | null => {
    // Check if position is over a card in hand
    const cardWidth = 80
    const cardHeight = 100
    const handY = height - 120
    const handStartX = (width - (hand.length * (cardWidth + 10))) / 2

    for (let i = 0; i < hand.length; i++) {
      const cardX = handStartX + i * (cardWidth + 10)
      const cardY = handY

      if (
        position.x >= cardX &&
        position.x <= cardX + cardWidth &&
        position.y >= cardY &&
        position.y <= cardY + cardHeight
      ) {
        return hand[i]
      }
    }

    return null
  }

  const isValidPlayPosition = (position: { x: number; y: number }): boolean => {
    // Define valid play area (bottom half of screen)
    const playAreaY = height * 0.5
    return position.y >= playAreaY && position.y <= height
  }

  return (
    <div className="game-canvas-container">
      <canvas ref={canvasRef} className="game-canvas" />
      
      {/* Elixir bar */}
      <div className="elixir-bar">
        <div className="elixir-text">
          {elixir}/{maxElixir}
        </div>
        <div className="elixir-fill" style={{ width: `${(elixir / maxElixir) * 100}%` }} />
      </div>

      {/* Hand cards */}
      <div className="hand-cards">
        {hand.map((card, index) => (
          <div
            key={card.id}
            className={`hand-card ${elixir < card.elixirCost ? 'disabled' : ''}`}
            style={{
              left: `${(width - (hand.length * 90)) / 2 + index * 90}px`,
              bottom: '20px'
            }}
          >
            <div className="card-elixir">{card.elixirCost}</div>
            <div className="card-name">{card.name}</div>
          </div>
        ))}
      </div>

      {/* Drag preview */}
      {isDragging && draggedCard && (
        <div
          className="drag-preview"
          style={{
            left: dragPosition.x - 40,
            top: dragPosition.y - 50,
            opacity: 0.7
          }}
        >
          <div className="card-elixir">{draggedCard.elixirCost}</div>
          <div className="card-name">{draggedCard.name}</div>
        </div>
      )}
    </div>
  )
}

export default GameCanvas

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Card {
  id: string
  name: string
  description: string
  elixirCost: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  health: number
  damage: number
  speed: number
  range: number
  targetType: 'ground' | 'air' | 'both'
  cardType: 'troop' | 'spell' | 'building'
  imageUrl?: string
  level: number
}

export interface GameState {
  isInGame: boolean
  isSearching: boolean
  currentMatch: {
    id: string
    player1: {
      id: string
      username: string
      trophies: number
      elixir: number
      towerHealth: {
        king: number
        princess1: number
        princess2: number
      }
    }
    player2: {
      id: string
      username: string
      trophies: number
      elixir: number
      towerHealth: {
        king: number
        princess1: number
        princess2: number
      }
    }
    gameTime: number
    status: 'waiting' | 'active' | 'finished'
    winner?: string
  } | null
  hand: Card[]
  elixir: number
  maxElixir: number
  gameActions: GameAction[]
  isPaused: boolean
}

export interface GameAction {
  id: string
  playerId: string
  actionType: 'play_card' | 'emote' | 'surrender'
  actionData: any
  timestamp: number
  gameTime: number
}

const initialState: GameState = {
  isInGame: false,
  isSearching: false,
  currentMatch: null,
  hand: [],
  elixir: 4,
  maxElixir: 10,
  gameActions: [],
  isPaused: false,
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startSearching: (state) => {
      state.isSearching = true
    },
    stopSearching: (state) => {
      state.isSearching = false
    },
    setCurrentMatch: (state, action: PayloadAction<GameState['currentMatch']>) => {
      state.currentMatch = action.payload
      state.isInGame = action.payload !== null
      state.isSearching = false
    },
    updateElixir: (state, action: PayloadAction<number>) => {
      state.elixir = action.payload
    },
    setHand: (state, action: PayloadAction<Card[]>) => {
      state.hand = action.payload
    },
    playCard: (state, action: PayloadAction<{ cardId: string; position: { x: number; y: number } }>) => {
      const { cardId } = action.payload
      const card = state.hand.find(c => c.id === cardId)
      
      if (card && state.elixir >= card.elixirCost) {
        state.elixir -= card.elixirCost
        state.hand = state.hand.filter(c => c.id !== cardId)
      }
    },
    addGameAction: (state, action: PayloadAction<GameAction>) => {
      state.gameActions.push(action.payload)
    },
    updateGameTime: (state, action: PayloadAction<number>) => {
      if (state.currentMatch) {
        state.currentMatch.gameTime = action.payload
      }
    },
    updatePlayerElixir: (state, action: PayloadAction<{ playerId: string; elixir: number }>) => {
      if (state.currentMatch) {
        if (state.currentMatch.player1.id === action.payload.playerId) {
          state.currentMatch.player1.elixir = action.payload.elixir
        } else if (state.currentMatch.player2.id === action.payload.playerId) {
          state.currentMatch.player2.elixir = action.payload.elixir
        }
      }
    },
    updateTowerHealth: (state, action: PayloadAction<{ playerId: string; towerType: 'king' | 'princess1' | 'princess2'; health: number }>) => {
      if (state.currentMatch) {
        const { playerId, towerType, health } = action.payload
        if (state.currentMatch.player1.id === playerId) {
          state.currentMatch.player1.towerHealth[towerType] = health
        } else if (state.currentMatch.player2.id === playerId) {
          state.currentMatch.player2.towerHealth[towerType] = health
        }
      }
    },
    setGamePaused: (state, action: PayloadAction<boolean>) => {
      state.isPaused = action.payload
    },
    endGame: (state, action: PayloadAction<{ winner: string }>) => {
      if (state.currentMatch) {
        state.currentMatch.status = 'finished'
        state.currentMatch.winner = action.payload.winner
      }
      state.isInGame = false
    },
    resetGame: (state) => {
      state.isInGame = false
      state.isSearching = false
      state.currentMatch = null
      state.hand = []
      state.elixir = 4
      state.gameActions = []
      state.isPaused = false
    },
  },
})

export const {
  startSearching,
  stopSearching,
  setCurrentMatch,
  updateElixir,
  setHand,
  playCard,
  addGameAction,
  updateGameTime,
  updatePlayerElixir,
  updateTowerHealth,
  setGamePaused,
  endGame,
  resetGame,
} = gameSlice.actions

export default gameSlice.reducer

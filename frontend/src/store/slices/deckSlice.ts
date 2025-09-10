import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Card } from './gameSlice'

export interface Deck {
  id: string
  name: string
  cards: Card[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserCard {
  cardId: string
  level: number
  count: number
}

export interface DeckState {
  decks: Deck[]
  activeDeck: Deck | null
  userCards: UserCard[]
  isLoading: boolean
  error: string | null
}

const initialState: DeckState = {
  decks: [],
  activeDeck: null,
  userCards: [],
  isLoading: false,
  error: null,
}

const deckSlice = createSlice({
  name: 'deck',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setDecks: (state, action: PayloadAction<Deck[]>) => {
      state.decks = action.payload
      state.activeDeck = action.payload.find(deck => deck.isActive) || null
    },
    setUserCards: (state, action: PayloadAction<UserCard[]>) => {
      state.userCards = action.payload
    },
    addDeck: (state, action: PayloadAction<Deck>) => {
      state.decks.push(action.payload)
    },
    updateDeck: (state, action: PayloadAction<Deck>) => {
      const index = state.decks.findIndex(deck => deck.id === action.payload.id)
      if (index !== -1) {
        state.decks[index] = action.payload
        if (action.payload.isActive) {
          state.activeDeck = action.payload
          // Deactivate other decks
          state.decks.forEach(deck => {
            if (deck.id !== action.payload.id) {
              deck.isActive = false
            }
          })
        }
      }
    },
    deleteDeck: (state, action: PayloadAction<string>) => {
      state.decks = state.decks.filter(deck => deck.id !== action.payload)
      if (state.activeDeck?.id === action.payload) {
        state.activeDeck = state.decks[0] || null
        if (state.activeDeck) {
          state.activeDeck.isActive = true
        }
      }
    },
    setActiveDeck: (state, action: PayloadAction<string>) => {
      // Deactivate all decks
      state.decks.forEach(deck => {
        deck.isActive = false
      })
      
      // Activate selected deck
      const deck = state.decks.find(deck => deck.id === action.payload)
      if (deck) {
        deck.isActive = true
        state.activeDeck = deck
      }
    },
    addCardToDeck: (state, action: PayloadAction<{ deckId: string; card: Card; slot: number }>) => {
      const { deckId, card, slot } = action.payload
      const deck = state.decks.find(d => d.id === deckId)
      
      if (deck && deck.cards.length < 8) {
        // Remove card from any existing slot
        deck.cards = deck.cards.filter(c => c.id !== card.id)
        
        // Add card to new slot
        deck.cards.push(card)
        
        // Update active deck if it's the one being modified
        if (deck.isActive) {
          state.activeDeck = deck
        }
      }
    },
    removeCardFromDeck: (state, action: PayloadAction<{ deckId: string; cardId: string }>) => {
      const { deckId, cardId } = action.payload
      const deck = state.decks.find(d => d.id === deckId)
      
      if (deck) {
        deck.cards = deck.cards.filter(c => c.id !== cardId)
        
        // Update active deck if it's the one being modified
        if (deck.isActive) {
          state.activeDeck = deck
        }
      }
    },
    clearDecks: (state) => {
      state.decks = []
      state.activeDeck = null
      state.userCards = []
      state.error = null
    },
  },
})

export const {
  setLoading,
  setError,
  setDecks,
  setUserCards,
  addDeck,
  updateDeck,
  deleteDeck,
  setActiveDeck,
  addCardToDeck,
  removeCardFromDeck,
  clearDecks,
} = deckSlice.actions

export default deckSlice.reducer

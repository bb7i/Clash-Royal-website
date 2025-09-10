import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { store } from '../store'
import { refreshAccessToken, clearAuth } from '../store/slices/authSlice'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const state = store.getState()
    const token = state.auth.accessToken
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        await store.dispatch(refreshAccessToken())
        const newState = store.getState()
        const newToken = newState.auth.accessToken
        
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        store.dispatch(clearAuth())
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials).then(res => res.data),
    
  register: (userData: { username: string; email: string; password: string }) =>
    api.post('/auth/register', userData).then(res => res.data),
    
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then(res => res.data),
    
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }).then(res => res.data),
}

// User API
export const userAPI = {
  getProfile: () =>
    api.get('/users/profile').then(res => res.data),
    
  updateProfile: (data: { username?: string; avatar?: string }) =>
    api.put('/users/profile', data).then(res => res.data),
}

// Deck API
export const deckAPI = {
  getDecks: () =>
    api.get('/decks').then(res => res.data),
    
  createDeck: (data: { name: string; cards: string[] }) =>
    api.post('/decks', data).then(res => res.data),
    
  updateDeck: (id: string, data: { name?: string; cards?: string[] }) =>
    api.put(`/decks/${id}`, data).then(res => res.data),
    
  deleteDeck: (id: string) =>
    api.delete(`/decks/${id}`).then(res => res.data),
    
  setActiveDeck: (id: string) =>
    api.post(`/decks/${id}/activate`).then(res => res.data),
}

// Matchmaking API
export const matchmakingAPI = {
  startSearch: () =>
    api.post('/matchmaking/search').then(res => res.data),
    
  cancelSearch: () =>
    api.delete('/matchmaking/search').then(res => res.data),
    
  getSearchStatus: () =>
    api.get('/matchmaking/status').then(res => res.data),
}

// Game API
export const gameAPI = {
  getGameStatus: (matchId: string) =>
    api.get(`/game/status/${matchId}`).then(res => res.data),
    
  playCard: (data: { cardId: string; position: { x: number; y: number } }) =>
    api.post('/game/action', { actionType: 'play_card', actionData: data }).then(res => res.data),
    
  sendEmote: (emote: string) =>
    api.post('/game/action', { actionType: 'emote', actionData: { emote } }).then(res => res.data),
    
  surrender: () =>
    api.post('/game/action', { actionType: 'surrender', actionData: {} }).then(res => res.data),
}

// Cards API
export const cardsAPI = {
  getAllCards: () =>
    api.get('/cards').then(res => res.data),
    
  getUserCards: () =>
    api.get('/cards/user').then(res => res.data),
    
  upgradeCard: (cardId: string) =>
    api.post(`/cards/${cardId}/upgrade`).then(res => res.data),
}

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: (limit: number = 100) =>
    api.get(`/leaderboard?limit=${limit}`).then(res => res.data),
}

export default api

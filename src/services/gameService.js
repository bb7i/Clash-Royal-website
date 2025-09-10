const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { getRedis } = require('../config/database');
const { logger } = require('../utils/logger');
const { GameEngine } = require('../game/GameEngine');

class GameService {
  constructor() {
    this.activeGames = new Map(); // matchId -> GameEngine
    this.playerSockets = new Map(); // userId -> socket
    this.socketPlayers = new Map(); // socketId -> userId
    this.io = null;
  }

  initialize(io) {
    this.io = io;
    logger.info('Game service initialized');
  }

  async joinGame(socket, data) {
    try {
      const { matchId, userId } = data;
      
      // Verify user is part of this match
      const matchResult = await query(
        'SELECT player1_id, player2_id, status FROM matches WHERE id = $1',
        [matchId]
      );

      if (matchResult.rows.length === 0) {
        socket.emit('error', { message: 'Match not found' });
        return;
      }

      const match = matchResult.rows[0];
      if (match.player1_id !== userId && match.player2_id !== userId) {
        socket.emit('error', { message: 'You are not part of this match' });
        return;
      }

      if (match.status !== 'active') {
        socket.emit('error', { message: 'Match is not active' });
        return;
      }

      // Store socket mapping
      this.playerSockets.set(userId, socket);
      this.socketPlayers.set(socket.id, userId);

      // Join socket room
      socket.join(`match:${matchId}`);

      // Get or create game engine
      let gameEngine = this.activeGames.get(matchId);
      if (!gameEngine) {
        // Get player data and decks
        const players = await this.getMatchPlayers(matchId);
        gameEngine = new GameEngine(matchId, players.player1, players.player2);
        this.activeGames.set(matchId, gameEngine);
        
        // Start the game
        gameEngine.start();
      }

      // Send current game state
      socket.emit('game-state', gameEngine.getGameState());

      // Start game updates for this socket
      this.startGameUpdates(socket, matchId);

      logger.info('Player joined game', { matchId, userId, socketId: socket.id });
    } catch (error) {
      logger.error('Join game error:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  }

  async getMatchPlayers(matchId) {
    const result = await query(
      `SELECT m.player1_id, m.player2_id,
              p1.username as player1_username, p1.trophies as player1_trophies,
              p2.username as player2_username, p2.trophies as player2_trophies
       FROM matches m
       JOIN users p1 ON m.player1_id = p1.id
       JOIN users p2 ON m.player2_id = p2.id
       WHERE m.id = $1`,
      [matchId]
    );

    if (result.rows.length === 0) {
      throw new Error('Match not found');
    }

    const match = result.rows[0];

    // Get active decks for both players
    const deck1Result = await query(
      `SELECT c.id, c.name, c.elixir_cost, c.rarity, c.health, c.damage, c.speed, c.range, c.target_type, c.card_type
       FROM decks d
       JOIN deck_cards dc ON d.id = dc.deck_id
       JOIN cards c ON dc.card_id = c.id
       WHERE d.user_id = $1 AND d.is_active = true
       ORDER BY dc.slot_number`,
      [match.player1_id]
    );

    const deck2Result = await query(
      `SELECT c.id, c.name, c.elixir_cost, c.rarity, c.health, c.damage, c.speed, c.range, c.target_type, c.card_type
       FROM decks d
       JOIN deck_cards dc ON d.id = dc.deck_id
       JOIN cards c ON dc.card_id = c.id
       WHERE d.user_id = $1 AND d.is_active = true
       ORDER BY dc.slot_number`,
      [match.player2_id]
    );

    return {
      player1: {
        id: match.player1_id,
        username: match.player1_username,
        trophies: match.player1_trophies,
        deck: deck1Result.rows
      },
      player2: {
        id: match.player2_id,
        username: match.player2_username,
        trophies: match.player2_trophies,
        deck: deck2Result.rows
      }
    };
  }

  startGameUpdates(socket, matchId) {
    const updateInterval = setInterval(() => {
      const gameEngine = this.activeGames.get(matchId);
      if (!gameEngine || gameEngine.gameState === 'finished') {
        clearInterval(updateInterval);
        return;
      }

      socket.emit('game-update', gameEngine.getGameState());
    }, 1000); // Send updates every second

    // Store interval ID for cleanup
    socket.gameUpdateInterval = updateInterval;
  }

  handleGameAction(socket, data) {
    try {
      const userId = this.socketPlayers.get(socket.id);
      if (!userId) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      const { matchId, actionType, actionData } = data;
      const gameEngine = this.activeGames.get(matchId);
      
      if (!gameEngine) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      if (gameEngine.gameState !== 'active') {
        socket.emit('error', { message: 'Game is not active' });
        return;
      }

      switch (actionType) {
        case 'play_card':
          this.handlePlayCard(gameEngine, userId, actionData, socket);
          break;
        case 'emote':
          this.handleEmote(gameEngine, userId, actionData, socket);
          break;
        case 'surrender':
          this.handleSurrender(gameEngine, userId, socket);
          break;
        default:
          socket.emit('error', { message: 'Unknown action type' });
      }
    } catch (error) {
      logger.error('Handle game action error:', error);
      socket.emit('error', { message: 'Failed to process action' });
    }
  }

  handlePlayCard(gameEngine, userId, actionData, socket) {
    const { cardId, position } = actionData;
    
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      socket.emit('error', { message: 'Invalid position' });
      return;
    }

    const success = gameEngine.playCard(userId, cardId, position);
    if (success) {
      // Broadcast to all players in the match
      this.io.to(`match:${gameEngine.matchId}`).emit('game-action', {
        playerId: userId,
        actionType: 'play_card',
        actionData,
        gameTime: gameEngine.gameTime
      });
    } else {
      socket.emit('error', { message: 'Cannot play card' });
    }
  }

  handleEmote(gameEngine, userId, actionData, socket) {
    const { emote } = actionData;
    
    // Log emote action
    gameEngine.logAction(userId, 'emote', { emote });
    
    // Broadcast to all players in the match
    this.io.to(`match:${gameEngine.matchId}`).emit('game-action', {
      playerId: userId,
      actionType: 'emote',
      actionData,
      gameTime: gameEngine.gameTime
    });
  }

  async handleSurrender(gameEngine, userId, socket) {
    const winnerId = gameEngine.player1.id === userId ? gameEngine.player2.id : gameEngine.player1.id;
    
    // End the game
    gameEngine.endGame('surrender', winnerId);
    
    // Save match result
    await this.saveMatchResult(gameEngine);
    
    // Clean up
    this.activeGames.delete(gameEngine.matchId);
    
    // Notify all players
    this.io.to(`match:${gameEngine.matchId}`).emit('game-ended', {
      winner: winnerId,
      reason: 'surrender'
    });
  }

  leaveGame(socket) {
    const userId = this.socketPlayers.get(socket.id);
    if (userId) {
      this.playerSockets.delete(userId);
      this.socketPlayers.delete(socket.id);
      
      // Clear update interval
      if (socket.gameUpdateInterval) {
        clearInterval(socket.gameUpdateInterval);
      }
      
      logger.info('Player left game', { userId, socketId: socket.id });
    }
  }

  async saveMatchResult(gameEngine) {
    try {
      const { matchId, winner, gameTime } = gameEngine;
      
      // Update match in database
      await query(
        `UPDATE matches 
         SET winner_id = $1, status = 'finished', finished_at = NOW(), duration_seconds = $2
         WHERE id = $3`,
        [winner, gameTime, matchId]
      );

      // Update player trophies (simplified)
      const trophyChange = 30; // Fixed trophy change for now
      
      if (winner === gameEngine.player1.id) {
        await query(
          'UPDATE users SET trophies = trophies + $1 WHERE id = $2',
          [trophyChange, gameEngine.player1.id]
        );
        await query(
          'UPDATE users SET trophies = GREATEST(trophies - $1, 0) WHERE id = $2',
          [trophyChange, gameEngine.player2.id]
        );
      } else {
        await query(
          'UPDATE users SET trophies = trophies + $1 WHERE id = $2',
          [trophyChange, gameEngine.player2.id]
        );
        await query(
          'UPDATE users SET trophies = GREATEST(trophies - $1, 0) WHERE id = $2',
          [trophyChange, gameEngine.player1.id]
        );
      }

      logger.info('Match result saved', { matchId, winner, gameTime });
    } catch (error) {
      logger.error('Save match result error:', error);
    }
  }

  // Cleanup inactive games
  cleanupInactiveGames() {
    for (const [matchId, gameEngine] of this.activeGames.entries()) {
      if (gameEngine.gameState === 'finished') {
        gameEngine.destroy();
        this.activeGames.delete(matchId);
      }
    }
  }
}

module.exports = { GameService: new GameService() };

const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { getRedis } = require('../config/database');
const { logger } = require('../utils/logger');

class MatchmakingService {
  constructor() {
    this.queue = new Map(); // userId -> searchData
    this.io = null;
    this.matchmakingInterval = null;
  }

  initialize(io) {
    this.io = io;
    this.startMatchmaking();
  }

  addToQueue(userId, searchData) {
    this.queue.set(userId, searchData);
    logger.info('Player added to queue', { userId, queueSize: this.queue.size });
  }

  removeFromQueue(userId) {
    this.queue.delete(userId);
    logger.info('Player removed from queue', { userId, queueSize: this.queue.size });
  }

  startMatchmaking() {
    // Run matchmaking every 2 seconds
    this.matchmakingInterval = setInterval(() => {
      this.processMatchmaking();
    }, 2000);

    logger.info('Matchmaking service started');
  }

  async processMatchmaking() {
    if (this.queue.size < 2) {
      return;
    }

    const players = Array.from(this.queue.values());
    
    // Sort players by trophies for better matching
    players.sort((a, b) => Math.abs(a.trophies - b.trophies));

    // Try to find matches
    for (let i = 0; i < players.length - 1; i++) {
      const player1 = players[i];
      
      for (let j = i + 1; j < players.length; j++) {
        const player2 = players[j];
        
        // Check if players are compatible (trophy range)
        if (this.arePlayersCompatible(player1, player2)) {
          await this.createMatch(player1, player2);
          return; // Process one match at a time
        }
      }
    }
  }

  arePlayersCompatible(player1, player2) {
    const trophyDiff = Math.abs(player1.trophies - player2.trophies);
    const maxTrophyDiff = this.getMaxTrophyDifference(player1.trophies);
    
    return trophyDiff <= maxTrophyDiff;
  }

  getMaxTrophyDifference(trophies) {
    // Dynamic trophy difference based on trophy count
    if (trophies < 1000) return 200;
    if (trophies < 2000) return 300;
    if (trophies < 3000) return 400;
    if (trophies < 4000) return 500;
    return 600;
  }

  async createMatch(player1, player2) {
    try {
      const matchId = uuidv4();
      
      // Create match in database
      const matchResult = await query(
        `INSERT INTO matches (id, player1_id, player2_id, status, started_at) 
         VALUES ($1, $2, $3, 'active', NOW()) 
         RETURNING id`,
        [matchId, player1.userId, player2.userId]
      );

      // Remove players from queue
      this.removeFromQueue(player1.userId);
      this.removeFromQueue(player2.userId);

      // Remove from Redis
      const redis = getRedis();
      await redis.del(`search:${player1.userId}`);
      await redis.del(`search:${player2.userId}`);

      // Notify players about match found
      this.notifyMatchFound(player1, player2, matchId);

      logger.info('Match created', { 
        matchId, 
        player1: player1.userId, 
        player2: player2.userId 
      });

    } catch (error) {
      logger.error('Error creating match:', error);
    }
  }

  notifyMatchFound(player1, player2, matchId) {
    // Notify player1
    if (player1.socketId && this.io) {
      this.io.to(player1.socketId).emit('match-found', {
        matchId,
        opponent: {
          id: player2.userId,
          username: player2.username,
          trophies: player2.trophies
        }
      });
    }

    // Notify player2
    if (player2.socketId && this.io) {
      this.io.to(player2.socketId).emit('match-found', {
        matchId,
        opponent: {
          id: player1.userId,
          username: player1.username,
          trophies: player1.trophies
        }
      });
    }
  }

  // Handle socket connection for queue
  handleSocketJoin(socket, searchData) {
    const userId = searchData.userId;
    
    // Update socket ID in queue
    if (this.queue.has(userId)) {
      const playerData = this.queue.get(userId);
      playerData.socketId = socket.id;
      this.queue.set(userId, playerData);
    }

    // Update socket ID in Redis
    const redis = getRedis();
    redis.get(`search:${userId}`).then(data => {
      if (data) {
        const search = JSON.parse(data);
        search.socketId = socket.id;
        redis.setex(`search:${userId}`, 300, JSON.stringify(search));
      }
    });

    logger.info('Socket joined queue', { socketId: socket.id, userId });
  }

  // Handle socket disconnection
  handleSocketLeave(socket) {
    // Find and remove player from queue
    for (const [userId, playerData] of this.queue.entries()) {
      if (playerData.socketId === socket.id) {
        this.removeFromQueue(userId);
        
        // Remove from Redis
        const redis = getRedis();
        redis.del(`search:${userId}`);
        
        logger.info('Socket left queue', { socketId: socket.id, userId });
        break;
      }
    }
  }

  stop() {
    if (this.matchmakingInterval) {
      clearInterval(this.matchmakingInterval);
      this.matchmakingInterval = null;
    }
    logger.info('Matchmaking service stopped');
  }
}

module.exports = { MatchmakingService: new MatchmakingService() };

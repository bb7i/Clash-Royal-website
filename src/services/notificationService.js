const jwt = require('jsonwebtoken');
const { getRedis } = require('../config/database');
const { logger } = require('../utils/logger');

class NotificationService {
  constructor() {
    this.authenticatedSockets = new Map(); // userId -> socket
    this.socketUsers = new Map(); // socketId -> userId
    this.io = null;
  }

  initialize(io) {
    this.io = io;
    logger.info('Notification service initialized');
  }

  authenticateSocket(socket, data) {
    try {
      const { token } = data;
      
      if (!token) {
        socket.emit('error', { message: 'Token required' });
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
      
      // Store socket mapping
      this.authenticatedSockets.set(decoded.userId, socket);
      this.socketUsers.set(socket.id, decoded.userId);
      
      // Join user-specific room
      socket.join(`user:${decoded.userId}`);

      logger.info('Socket authenticated', { 
        socketId: socket.id, 
        userId: decoded.userId 
      });

      socket.emit('authenticated', { userId: decoded.userId });
    } catch (error) {
      logger.error('Socket authentication error:', error);
      socket.emit('error', { message: 'Invalid token' });
    }
  }

  joinRoom(socket, data) {
    try {
      const { room } = data;
      
      if (!room) {
        socket.emit('error', { message: 'Room name required' });
        return;
      }

      socket.join(room);
      logger.info('Socket joined room', { 
        socketId: socket.id, 
        room 
      });

      socket.emit('room-joined', { room });
    } catch (error) {
      logger.error('Join room error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  leaveRoom(socket, data) {
    try {
      const { room } = data;
      
      if (room) {
        socket.leave(room);
        logger.info('Socket left room', { 
          socketId: socket.id, 
          room 
        });
        socket.emit('room-left', { room });
      }
    } catch (error) {
      logger.error('Leave room error:', error);
    }
  }

  handleDisconnect(socket) {
    const userId = this.socketUsers.get(socket.id);
    
    if (userId) {
      this.authenticatedSockets.delete(userId);
      this.socketUsers.delete(socket.id);
      
      logger.info('Socket disconnected', { 
        socketId: socket.id, 
        userId 
      });
    }
  }

  // Send notification to specific user
  sendToUser(userId, event, data) {
    const socket = this.authenticatedSockets.get(userId);
    
    if (socket) {
      socket.emit(event, data);
      logger.info('Notification sent to user', { userId, event });
    } else {
      logger.warn('User socket not found', { userId });
    }
  }

  // Send notification to room
  sendToRoom(room, event, data) {
    if (this.io) {
      this.io.to(room).emit(event, data);
      logger.info('Notification sent to room', { room, event });
    }
  }

  // Send notification to all users
  sendToAll(event, data) {
    if (this.io) {
      this.io.emit(event, data);
      logger.info('Notification sent to all users', { event });
    }
  }

  // Send match found notification
  sendMatchFound(userId, matchData) {
    this.sendToUser(userId, 'match-found', matchData);
  }

  // Send game update notification
  sendGameUpdate(matchId, gameData) {
    this.sendToRoom(`match:${matchId}`, 'game-update', gameData);
  }

  // Send game action notification
  sendGameAction(matchId, actionData) {
    this.sendToRoom(`match:${matchId}`, 'game-action', actionData);
  }

  // Send game ended notification
  sendGameEnded(matchId, resultData) {
    this.sendToRoom(`match:${matchId}`, 'game-ended', resultData);
  }

  // Send leaderboard update notification
  sendLeaderboardUpdate() {
    this.sendToAll('leaderboard-updated', { timestamp: new Date().toISOString() });
  }

  // Send chest ready notification
  sendChestReady(userId, chestData) {
    this.sendToUser(userId, 'chest-ready', chestData);
  }

  // Send friend request notification
  sendFriendRequest(userId, requestData) {
    this.sendToUser(userId, 'friend-request', requestData);
  }

  // Send achievement notification
  sendAchievement(userId, achievementData) {
    this.sendToUser(userId, 'achievement', achievementData);
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.authenticatedSockets.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.authenticatedSockets.has(userId);
  }
}

module.exports = { NotificationService: new NotificationService() };

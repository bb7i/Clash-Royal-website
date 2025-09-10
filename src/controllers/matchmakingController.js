const { query } = require('../config/database');
const { getRedis } = require('../config/database');
const { logger } = require('../utils/logger');
const { MatchmakingService } = require('../services/matchmakingService');

// Start matchmaking search
const startSearch = async (req, res) => {
  try {
    const { userId, username, trophies } = req.user;

    // Check if user is already in queue
    const { getRedis } = require('../config/database');
    const redis = getRedis();
    const existingSearch = await redis.get(`search:${userId}`);

    if (existingSearch) {
      return res.status(409).json({ error: 'User is already searching for a match' });
    }

    // Check if user has an active deck
    const deckResult = await query(
      'SELECT id FROM decks WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    if (deckResult.rows.length === 0) {
      return res.status(400).json({ error: 'No active deck found. Please select a deck first.' });
    }

    // Store search data in Redis
    const searchData = {
      userId,
      username,
      trophies,
      deckId: deckResult.rows[0].id,
      startTime: Date.now(),
      socketId: null // Will be set when socket connects
    };

    await redis.setex(`search:${userId}`, 300, JSON.stringify(searchData)); // 5 minutes TTL

    // Add to matchmaking queue
    await MatchmakingService.addToQueue(userId, searchData);

    logger.info('Search started', { userId, username, trophies });

    res.json({
      message: 'Search started successfully',
      searchId: userId
    });
  } catch (error) {
    logger.error('Start search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel matchmaking search
const cancelSearch = async (req, res) => {
  try {
    const { userId } = req.user;

    const { getRedis } = require('../config/database');
    const redis = getRedis();
    const existingSearch = await redis.get(`search:${userId}`);

    if (!existingSearch) {
      return res.status(404).json({ error: 'No active search found' });
    }

    // Remove from queue and Redis
    await MatchmakingService.removeFromQueue(userId);
    await redis.del(`search:${userId}`);

    logger.info('Search cancelled', { userId });

    res.json({ message: 'Search cancelled successfully' });
  } catch (error) {
    logger.error('Cancel search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get search status
const getSearchStatus = async (req, res) => {
  try {
    const { userId } = req.user;

    const { getRedis } = require('../config/database');
    const redis = getRedis();
    const searchData = await redis.get(`search:${userId}`);

    if (!searchData) {
      return res.json({
        isSearching: false,
        searchTime: 0
      });
    }

    const search = JSON.parse(searchData);
    const searchTime = Math.floor((Date.now() - search.startTime) / 1000);

    res.json({
      isSearching: true,
      searchTime,
      trophies: search.trophies
    });
  } catch (error) {
    logger.error('Get search status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  startSearch,
  cancelSearch,
  getSearchStatus
};

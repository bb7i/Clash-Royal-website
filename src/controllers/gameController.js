const { query, getRedis } = require('../config/database');
const { logger } = require('../utils/logger');

// Get game status
const getGameStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { userId } = req.user;

    // Get match details
    const matchResult = await query(
      `SELECT m.id, m.player1_id, m.player2_id, m.status, m.started_at, m.finished_at,
              p1.username as player1_username, p1.trophies as player1_trophies,
              p2.username as player2_username, p2.trophies as player2_trophies
       FROM matches m
       JOIN users p1 ON m.player1_id = p1.id
       JOIN users p2 ON m.player2_id = p2.id
       WHERE m.id = $1 AND (m.player1_id = $2 OR m.player2_id = $2)`,
      [matchId, userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const match = matchResult.rows[0];

    // Get game state from Redis if match is active
    let gameState = null;
    if (match.status === 'active') {
      const redis = getRedis();
      const gameData = await redis.get(`game:${matchId}`);
      
      if (gameData) {
        gameState = JSON.parse(gameData);
      }
    }

    logger.info('Game status retrieved', { matchId, userId });

    res.json({
      match: {
        id: match.id,
        status: match.status,
        startedAt: match.started_at,
        finishedAt: match.finished_at,
        players: {
          player1: {
            id: match.player1_id,
            username: match.player1_username,
            trophies: match.player1_trophies
          },
          player2: {
            id: match.player2_id,
            username: match.player2_username,
            trophies: match.player2_trophies
          }
        }
      },
      gameState
    });
  } catch (error) {
    logger.error('Get game status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get game history
const getGameHistory = async (req, res) => {
  try {
    const { userId } = req.user;
    const { limit = 20, offset = 0 } = req.query;

    const result = await query(
      `SELECT m.id, m.status, m.started_at, m.finished_at, m.duration_seconds,
              m.player1_trophies_before, m.player1_trophies_after,
              m.player2_trophies_before, m.player2_trophies_after,
              p1.username as player1_username, p2.username as player2_username,
              CASE 
                WHEN m.winner_id = $1 THEN 'win'
                WHEN m.winner_id IS NULL THEN 'draw'
                ELSE 'loss'
              END as result
       FROM matches m
       JOIN users p1 ON m.player1_id = p1.id
       JOIN users p2 ON m.player2_id = p2.id
       WHERE m.player1_id = $1 OR m.player2_id = $1
       ORDER BY m.started_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    const games = result.rows.map(game => ({
      id: game.id,
      status: game.status,
      startedAt: game.started_at,
      finishedAt: game.finished_at,
      duration: game.duration_seconds,
      result: game.result,
      players: {
        player1: {
          username: game.player1_username,
          trophiesBefore: game.player1_trophies_before,
          trophiesAfter: game.player1_trophies_after
        },
        player2: {
          username: game.player2_username,
          trophiesBefore: game.player2_trophies_before,
          trophiesAfter: game.player2_trophies_after
        }
      }
    }));

    logger.info('Game history retrieved', { userId, count: games.length });

    res.json({
      games,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: games.length
      }
    });
  } catch (error) {
    logger.error('Get game history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getGameStatus,
  getGameHistory
};

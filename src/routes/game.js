const express = require('express');
const { 
  getGameStatus, 
  getGameHistory 
} = require('../controllers/gameController');
const { authenticateToken } = require('../middleware/authenticateToken');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Game routes
router.get('/status/:matchId', getGameStatus);
router.get('/history', getGameHistory);

module.exports = router;

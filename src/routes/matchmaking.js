const express = require('express');
const { 
  startSearch, 
  cancelSearch, 
  getSearchStatus 
} = require('../controllers/matchmakingController');
const { authenticateToken } = require('../middleware/authenticateToken');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Matchmaking routes
router.post('/search', startSearch);
router.delete('/search', cancelSearch);
router.get('/status', getSearchStatus);

module.exports = router;

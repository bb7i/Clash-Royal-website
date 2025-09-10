const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { logger } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists
    const result = await query(
      'SELECT id, username FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    logger.error('Token authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { authenticateToken };

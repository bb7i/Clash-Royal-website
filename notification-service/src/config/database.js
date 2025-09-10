const Redis = require('redis');
const { logger } = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    await redisClient.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};

const getRedis = () => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

module.exports = {
  connectRedis,
  getRedis
};

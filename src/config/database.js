const { Pool } = require('pg');
const Redis = require('redis');
const { logger } = require('../utils/logger');

let pool;
let redisClient;

const connectDatabase = async () => {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

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

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return pool;
};

const getRedis = () => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Query error', { text, error: error.message });
    throw error;
  }
};

const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  connectDatabase,
  connectRedis,
  getPool,
  getRedis,
  query,
  getClient
};

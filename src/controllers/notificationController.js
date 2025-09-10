const { getRedis } = require('../config/database');
const { logger } = require('../utils/logger');
const { NotificationService } = require('../services/notificationService');

// Send notification to user
const sendNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, type, title, message' 
      });
    }

    const notification = {
      id: Date.now().toString(),
      userId,
      type,
      title,
      message,
      data: data || {},
      timestamp: new Date().toISOString(),
      read: false
    };

    // Store notification in Redis
    const { getRedis } = require('../config/database');
    const redis = getRedis();
    await redis.lpush(`notifications:${userId}`, JSON.stringify(notification));
    
    // Keep only last 100 notifications per user
    await redis.ltrim(`notifications:${userId}`, 0, 99);

    // Send real-time notification via WebSocket
    NotificationService.sendToUser(userId, 'notification', notification);

    logger.info('Notification sent', { userId, type, title });

    res.json({ 
      message: 'Notification sent successfully',
      notificationId: notification.id
    });
  } catch (error) {
    logger.error('Send notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get notifications for user
const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { getRedis } = require('../config/database');
    const redis = getRedis();
    const notifications = await redis.lrange(
      `notifications:${userId}`, 
      parseInt(offset), 
      parseInt(offset) + parseInt(limit) - 1
    );

    const parsedNotifications = notifications.map(notification => 
      JSON.parse(notification)
    );

    logger.info('Notifications retrieved', { userId, count: parsedNotifications.length });

    res.json({ 
      notifications: parsedNotifications,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: parsedNotifications.length
      }
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { getRedis } = require('../config/database');
    const redis = getRedis();
    const notifications = await redis.lrange(`notifications:${userId}`, 0, -1);
    
    let found = false;
    const updatedNotifications = notifications.map(notification => {
      const parsed = JSON.parse(notification);
      if (parsed.id === notificationId) {
        parsed.read = true;
        found = true;
      }
      return JSON.stringify(parsed);
    });

    if (found) {
      // Replace all notifications
      await redis.del(`notifications:${userId}`);
      if (updatedNotifications.length > 0) {
        await redis.lpush(`notifications:${userId}`, ...updatedNotifications);
      }

      logger.info('Notification marked as read', { userId, notificationId });
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    logger.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  sendNotification,
  getNotifications,
  markAsRead
};

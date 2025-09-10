const express = require('express');
const { 
  sendNotification, 
  getNotifications,
  markAsRead 
} = require('../controllers/notificationController');

const router = express.Router();

// Notification routes
router.post('/send', sendNotification);
router.get('/:userId', getNotifications);
router.put('/:notificationId/read', markAsRead);

module.exports = router;

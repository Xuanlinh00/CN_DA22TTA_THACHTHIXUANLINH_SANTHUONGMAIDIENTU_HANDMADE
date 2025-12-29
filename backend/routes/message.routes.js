const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage,
  getUnreadCount
} = require('../controllers/message.controller');

// Tất cả routes cần xác thực
router.use(protect);

// Lấy danh sách cuộc trò chuyện (phải trước /:recipientId)
router.get('/conversations', getConversations);

// Lấy số tin nhắn chưa đọc
router.get('/unread-count', getUnreadCount);

// Gửi tin nhắn
router.post('/', sendMessage);

// Lấy tin nhắn trong cuộc trò chuyện
router.get('/:recipientId', getMessages);

// Đánh dấu tin nhắn là đã đọc
router.patch('/:messageId/read', markAsRead);

// Xóa tin nhắn
router.delete('/:messageId', deleteMessage);

module.exports = router;

// 消息路由
const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getConversation, 
  getConversations, 
  markAsRead,
  deleteMessage
} = require('../controllers/messageController');
const auth = require('../middlewares/auth');

// 发送消息
router.post('/', auth, sendMessage);

// 获取会话消息
router.get('/conversation/:conversationId', auth, getConversation);

// 获取用户会话列表
router.get('/conversations', auth, getConversations);

// 标记消息为已读
router.put('/:messageId/read', auth, markAsRead);

// 删除消息
router.delete('/:messageId', auth, deleteMessage);

module.exports = router;
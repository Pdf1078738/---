// 消息模型
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  // 会话信息
  conversationId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  // 消息内容
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  
  // 消息状态
  isRead: { type: Boolean, default: false },
  
  // 系统信息
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
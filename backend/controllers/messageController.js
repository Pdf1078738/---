// 消息控制器
const Message = require('../models/Message');

// 发送消息
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const sender = req.user;
    
    // 验证必要参数
    if (!receiverId || !content) {
      res.status(400);
      throw new Error('缺少必要参数');
    }
    
    // 创建会话ID（确保会话ID唯一且顺序一致）
    const conversationId = [sender._id, receiverId].sort().join('_');
    
    // 创建消息
    const message = await Message.create({
      conversationId,
      sender: sender._id,
      receiver: receiverId,
      content
    });
    
    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

// 获取会话消息
exports.getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const user = req.user;
    
    // 验证会话ID是否包含当前用户
    const [userId1, userId2] = conversationId.split('_');
    if (userId1 !== user._id.toString() && userId2 !== user._id.toString()) {
      res.status(403);
      throw new Error('无权访问该会话');
    }
    
    // 获取会话消息
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    
    // 标记消息为已读
    await Message.updateMany(
      { conversationId, receiver: user._id, isRead: false },
      { $set: { isRead: true } }
    );
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户会话列表
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // 获取用户参与的所有会话
    const messages = await Message.aggregate([
      // 查找用户参与的所有消息
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      // 按会话分组
      { $group: {
        _id: '$conversationId',
        lastMessage: { $last: '$$ROOT' },
        unreadCount: { $sum: {
          $cond: [{
            $and: [
              { $eq: ['$receiver', userId] },
              { $eq: ['$isRead', false] }
            ]
          }, 1, 0] }
        }
      } },
      // 按最后消息时间排序
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);
    
    res.json({
      success: true,
      conversations: messages
    });
  } catch (error) {
    next(error);
  }
};

// 标记消息为已读
exports.markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const user = req.user;
    
    // 更新消息状态
    const message = await Message.findOneAndUpdate(
      { _id: messageId, receiver: user._id },
      { $set: { isRead: true } },
      { new: true }
    );
    
    if (!message) {
      res.status(404);
      throw new Error('消息不存在或无权访问');
    }
    
    res.json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

// 删除消息
exports.deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const user = req.user;
    
    // 查找消息
    const message = await Message.findById(messageId);
    
    if (!message) {
      res.status(404);
      throw new Error('消息不存在');
    }
    
    // 检查是否是消息的发送者或接收者
    if (message.sender.toString() !== user._id.toString() && message.receiver.toString() !== user._id.toString()) {
      res.status(403);
      throw new Error('无权删除此消息');
    }
    
    // 删除消息
    await message.deleteOne();
    
    res.json({
      success: true,
      message: '消息删除成功'
    });
  } catch (error) {
    next(error);
  }
};
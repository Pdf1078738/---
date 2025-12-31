// 用户控制器
const User = require('../models/User');
const Item = require('../models/Item');
const Order = require('../models/Order');

// 获取用户个人资料
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
        role: user.role,
        creditScore: user.creditScore,
        tradeCount: user.tradeCount,
        interests: user.interests,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// 更新用户个人资料
exports.updateUserProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const user = req.user;
    
    // 更新用户信息
    Object.assign(user, updates);
    await user.save();
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
        role: user.role,
        creditScore: user.creditScore,
        tradeCount: user.tradeCount,
        interests: user.interests,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户发布的物品
exports.getUserItems = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // 查找用户发布的物品
    const items = await Item.find({ 'seller.id': userId });
    
    res.json({
      success: true,
      items
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户的订单
exports.getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, status } = req.query;
    
    // 构建查询条件
    const query = {
      $or: [
        { 'buyer.id': userId },
        { 'seller.id': userId }
      ]
    };
    
    // 添加订单类型过滤
    if (type) {
      query.tradeType = type;
    }
    
    // 添加订单状态过滤
    if (status) {
      query.status = status;
    }
    
    // 获取订单列表
    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};
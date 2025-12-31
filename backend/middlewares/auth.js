// 身份验证中间件
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const auth = async (req, res, next) => {
  try {
    // 从请求头获取 token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401);
      throw new Error('未提供认证令牌');
    }
    
    // 验证 token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.id);
    
    if (!user) {
      res.status(401);
      throw new Error('用户不存在');
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401);
    next(error);
  }
};

module.exports = auth;
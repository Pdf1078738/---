// 认证控制器
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

// 注册
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, name, studentId } = req.body;
    
    // 检查用户是否已存在
    const userExists = await User.findOne({ $or: [{ username }, { email }, { studentId }] });
    if (userExists) {
      res.status(400);
      throw new Error('用户已存在');
    }
    
    // 创建新用户
    const user = await User.create({
      username,
      email,
      password,
      name,
      studentId
    });
    
    // 生成 token
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    });
    
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// 登录
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // 检查用户是否存在
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error('用户不存在');
    }
    
    // 验证密码
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('密码错误');
    }
    
    // 生成 token
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    });
    
    // 更新最后登录时间
    user.lastLogin = Date.now();
    await user.save();
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// 登出
exports.logout = (req, res) => {
  // 在客户端清除 token
  res.json({
    success: true,
    message: '登出成功'
  });
};
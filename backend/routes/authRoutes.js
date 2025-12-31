// 认证路由
const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');

// 注册
router.post('/register', register);

// 登录
router.post('/login', login);

// 登出
router.post('/logout', logout);

module.exports = router;
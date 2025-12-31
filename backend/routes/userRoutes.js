// 用户路由
const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getUserItems, getUserOrders } = require('../controllers/userController');
const auth = require('../middlewares/auth');

// 获取用户个人资料
router.get('/profnpm run devile', auth, getUserProfile);

// 更新用户个人资料
router.put('/profile', auth, updateUserProfile);

// 获取用户发布的物品
router.get('/items', auth, getUserItems);

// 获取用户的订单
router.get('/orders', auth, getUserOrders);

module.exports = router;
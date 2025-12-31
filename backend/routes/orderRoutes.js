// 订单路由
const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getOrderById, 
  updateOrderStatus, 
  getUserOrders, 
  payOrder, 
  shipOrder, 
  receiveOrder, 
  cancelOrder
} = require('../controllers/orderController');
const auth = require('../middlewares/auth');

// 创建订单
router.post('/', auth, createOrder);

// 获取订单详情
router.get('/:orderId', auth, getOrderById);

// 更新订单状态
router.put('/:orderId/status', auth, updateOrderStatus);

// 获取用户订单
router.get('/user/:userId', auth, getUserOrders);

// 支付订单
router.post('/:orderId/pay', auth, payOrder);

// 确认发货
router.post('/:orderId/ship', auth, shipOrder);

// 确认收货
router.post('/:orderId/receive', auth, receiveOrder);

// 取消订单
router.post('/:orderId/cancel', auth, cancelOrder);

module.exports = router;
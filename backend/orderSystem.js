// 订单与交易系统后端逻辑
// 使用Node.js + Express + MongoDB实现

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();


// 订单状态枚举
const ORDER_STATUS = {
  PENDING_PAYMENT: '待付款',
  PENDING_SHIPMENT: '待发货',
  PENDING_RECEIPT: '待收货',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  PENDING_TRADE: '待交易' // 与前端profile.html中的"待交易"状态对应
};

// 交易类型枚举
const TRADE_TYPE = {
  SELL: 'sell', // 卖出
  BUY: 'buy'    // 买入
};

// 交易方式枚举
const TRADE_METHOD = {
  FACE_TO_FACE: 'face-to-face', // 当面交易
  CAMPUS: 'campus'              // 校内交易
};

// 订单模型定义
const OrderSchema = new mongoose.Schema({
  // 订单基本信息
  orderId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING_PAYMENT },
  
  // 物品信息
  item: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Item' },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    condition: { type: String } // 物品状态
  },
  
  // 交易双方信息
  buyer: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    avatar: { type: String }
  },
  seller: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    avatar: { type: String }
  },
  
  // 交易信息
  tradeType: { type: String, enum: Object.values(TRADE_TYPE), required: true },
  tradeMethod: { type: String, enum: Object.values(TRADE_METHOD), required: true },
  tradeLocation: { type: String }, // 交易地点
  
  // 支付信息
  paymentInfo: {
    method: { type: String },
    transactionId: { type: String },
    paidAt: { type: Date }
  }
});

const Order = mongoose.model('Order', OrderSchema);

// 1. 订单管理功能

/**
 * 生成订单
 * @param {Object} req - 请求对象，包含物品信息、交易双方信息、交易方式等
 * @param {Object} res - 响应对象
 */
router.post('/orders', async (req, res) => {
  try {
    const { itemId, buyerId, sellerId, tradeMethod, tradeLocation } = req.body;
    
    // 验证必要参数
    if (!itemId || !buyerId || !sellerId || !tradeMethod) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 获取物品信息
    const item = await mongoose.model('Item').findById(itemId);
    if (!item) {
      return res.status(404).json({ error: '物品不存在' });
    }
    
    // 检查物品状态是否为在售
    if (item.status !== 'selling') {
      return res.status(400).json({ error: '物品已售或不可用' });
    }
    
    // 获取买卖双方信息
    const buyer = await mongoose.model('User').findById(buyerId, 'name avatar');
    const seller = await mongoose.model('User').findById(sellerId, 'name avatar');
    
    if (!buyer || !seller) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 生成订单号
    const orderId = `ORDER${Date.now()}${Math.floor(Math.random() * 1000)}`;
   

    // 创建订单
    const order = new Order({
      orderId,
      totalAmount: item.price,
      status: ORDER_STATUS.PENDING_PAYMENT,
      item: {
        id: item._id,
        title: item.title,
        price: item.price,
        images: item.images,
        condition: item.condition
      },
      buyer: {
        id: buyer._id,
        name: buyer.name,
        avatar: buyer.avatar
      },
      seller: {
        id: seller._id,
        name: seller.name,
        avatar: seller.avatar
      },
      tradeType: TRADE_TYPE.BUY, // 默认买入
      tradeMethod,
      tradeLocation
    });
    
    await order.save();
    
    // 更新物品状态为待交易
    await mongoose.model('Item').findByIdAndUpdate(itemId, { status: 'pending' });
    
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('生成订单失败:', error);
    res.status(500).json({ error: '生成订单失败' });
  }
});

/**
 * 获取订单详情
 * @param {Object} req - 请求对象，包含订单ID
 * @param {Object} res - 响应对象
 */
router.get('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({ error: '获取订单详情失败' });
  }
});

/**
 * 更新订单状态
 * @param {Object} req - 请求对象，包含订单ID和新状态
 * @param {Object} res - 响应对象
 */
router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // 验证状态值
    if (!Object.values(ORDER_STATUS).includes(status)) {
      return res.status(400).json({ error: '无效的订单状态' });
    }
    
    // 更新订单状态
    const order = await Order.findOneAndUpdate(
      { orderId },
      { $set: { status, updatedAt: Date.now() } },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    // 如果订单完成，更新物品状态为已售
    if (status === ORDER_STATUS.COMPLETED) {
      await mongoose.model('Item').findByIdAndUpdate(order.item.id, { status: 'sold' });
    }
    
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({ error: '更新订单状态失败' });
  }
});

/**
 * 获取用户订单列表
 * @param {Object} req - 请求对象，包含用户ID和订单类型
 * @param {Object} res - 响应对象
 */
router.get('/users/:userId/orders', async (req, res) => {
  try {
    const { userId } = req.params;
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
    
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('获取用户订单列表失败:', error);
    res.status(500).json({ error: '获取用户订单列表失败' });
  }
});

// 2. 交易流程功能

/**
 * 支付订单
 * @param {Object} req - 请求对象，包含订单ID和支付信息
 * @param {Object} res - 响应对象
 */
router.post('/orders/:orderId/pay', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod, transactionId } = req.body;
    
    // 更新订单支付信息
    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        $set: {
          status: ORDER_STATUS.PENDING_SHIPMENT,
          paymentInfo: {
            method: paymentMethod,
            transactionId,
            paidAt: Date.now()
          },
          updatedAt: Date.now()
        }
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('支付订单失败:', error);
    res.status(500).json({ error: '支付订单失败' });
  }
});

/**
 * 确认发货
 * @param {Object} req - 请求对象，包含订单ID
 * @param {Object} res - 响应对象
 */
router.post('/orders/:orderId/ship', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // 更新订单状态为待收货
    const order = await Order.findOneAndUpdate(
      { orderId },
      { $set: { status: ORDER_STATUS.PENDING_RECEIPT, updatedAt: Date.now() } },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('确认发货失败:', error);
    res.status(500).json({ error: '确认发货失败' });
  }
});

/**
 * 确认收货
 * @param {Object} req - 请求对象，包含订单ID
 * @param {Object} res - 响应对象
 */
router.post('/orders/:orderId/receive', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // 更新订单状态为已完成
    const order = await Order.findOneAndUpdate(
      { orderId },
      { $set: { status: ORDER_STATUS.COMPLETED, updatedAt: Date.now() } },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    // 更新物品状态为已售
    await mongoose.model('Item').findByIdAndUpdate(order.item.id, { status: 'sold' });
    
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('确认收货失败:', error);
    res.status(500).json({ error: '确认收货失败' });
  }
});

/**
 * 取消订单
 * @param {Object} req - 请求对象，包含订单ID和取消原因
 * @param {Object} res - 响应对象
 */
router.post('/orders/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // 更新订单状态为已取消
    const order = await Order.findOneAndUpdate(
      { orderId },
      { $set: { status: ORDER_STATUS.CANCELLED, updatedAt: Date.now() } },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    // 更新物品状态为在售
    await mongoose.model('Item').findByIdAndUpdate(order.item.id, { status: 'selling' });
    
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(500).json({ error: '取消订单失败' });
  }
});



module.exports = router;

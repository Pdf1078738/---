// 订单控制器
const Order = require('../models/Order');
const Item = require('../models/Item');
const { ORDER_STATUS, TRADE_TYPE, TRADE_METHOD } = require('../utils/constants');

// 创建订单
exports.createOrder = async (req, res, next) => {
  try {
    const { itemId, sellerId, tradeMethod, tradeLocation } = req.body;
    const buyer = req.user;
    
    // 验证必要参数
    if (!itemId || !sellerId || !tradeMethod) {
      res.status(400);
      throw new Error('缺少必要参数');
    }
    
    // 获取物品信息
    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404);
      throw new Error('物品不存在');
    }
    
    // 检查物品状态是否为在售
    if (item.status !== 'selling') {
      res.status(400);
      throw new Error('物品已售或不可用');
    }
    
    // 生成订单号
    const orderId = `ORDER${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // 创建订单
    const order = await Order.create({
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
        id: sellerId,
        name: item.seller.name,
        avatar: item.seller.avatar
      },
      tradeType: TRADE_TYPE.BUY,
      tradeMethod,
      tradeLocation
    });
    
    // 更新物品状态为待交易
    await Item.findByIdAndUpdate(itemId, { status: 'pending' });
    
    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// 获取订单详情
exports.getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    // 查找订单
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      res.status(404);
      throw new Error('订单不存在');
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// 更新订单状态
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // 验证状态值
    if (!Object.values(ORDER_STATUS).includes(status)) {
      res.status(400);
      throw new Error('无效的订单状态');
    }
    
    // 更新订单状态
    const order = await Order.findOneAndUpdate(
      { orderId },
      { $set: { status, updatedAt: Date.now() } },
      { new: true }
    );
    
    if (!order) {
      res.status(404);
      throw new Error('订单不存在');
    }
    
    // 如果订单完成，更新物品状态为已售
    if (status === ORDER_STATUS.COMPLETED) {
      await Item.findByIdAndUpdate(order.item.id, { status: 'sold' });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户订单
exports.getUserOrders = async (req, res, next) => {
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
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// 支付订单
exports.payOrder = async (req, res, next) => {
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
      res.status(404);
      throw new Error('订单不存在');
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// 确认发货
exports.shipOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    // 更新订单状态为待收货
    const order = await Order.findOneAndUpdate(
      { orderId },
      { $set: { status: ORDER_STATUS.PENDING_RECEIPT, updatedAt: Date.now() } },
      { new: true }
    );
    
    if (!order) {
      res.status(404);
      throw new Error('订单不存在');
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// 确认收货
exports.receiveOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    // 更新订单状态为已完成
    const order = await Order.findOneAndUpdate(
      { orderId },
      { $set: { status: ORDER_STATUS.COMPLETED, updatedAt: Date.now() } },
      { new: true }
    );
    
    if (!order) {
      res.status(404);
      throw new Error('订单不存在');
    }
    
    // 更新物品状态为已售
    await Item.findByIdAndUpdate(order.item.id, { status: 'sold' });
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// 取消订单
exports.cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    // 更新订单状态为已取消
    const order = await Order.findOneAndUpdate(
      { orderId },
      { $set: { status: ORDER_STATUS.CANCELLED, updatedAt: Date.now() } },
      { new: true }
    );
    
    if (!order) {
      res.status(404);
      throw new Error('订单不存在');
    }
    
    // 更新物品状态为在售
    await Item.findByIdAndUpdate(order.item.id, { status: 'selling' });
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};
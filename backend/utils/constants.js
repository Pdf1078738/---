// 常量定义

// 订单状态
exports.ORDER_STATUS = {
  PENDING_PAYMENT: '待付款',
  PENDING_SHIPMENT: '待发货',
  PENDING_RECEIPT: '待收货',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  PENDING_TRADE: '待交易'
};

// 交易类型
exports.TRADE_TYPE = {
  SELL: 'sell',
  BUY: 'buy'
};

// 交易方式
exports.TRADE_METHOD = {
  FACE_TO_FACE: 'face-to-face',
  CAMPUS: 'campus'
};

// 物品状态
exports.ITEM_STATUS = {
  SELLING: 'selling',
  PENDING: 'pending',
  SOLD: 'sold'
};

// 用户角色
exports.USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user'
};
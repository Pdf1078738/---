// 订单模型
const mongoose = require('mongoose');
const { ORDER_STATUS, TRADE_TYPE, TRADE_METHOD } = require('../utils/constants');

const OrderSchema = new mongoose.Schema({
  // 订单基本信息
  orderId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING_PAYMENT },
  
  // 物品信息
  item: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    condition: { type: String }
  },
  
  // 交易双方信息
  buyer: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    avatar: { type: String }
  },
  seller: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    avatar: { type: String }
  },
  
  // 交易信息
  tradeType: { type: String, enum: Object.values(TRADE_TYPE), required: true },
  tradeMethod: { type: String, enum: Object.values(TRADE_METHOD), required: true },
  tradeLocation: { type: String },
  
  // 支付信息
  paymentInfo: {
    method: { type: String },
    transactionId: { type: String },
    paidAt: { type: Date }
  },
  
  // 评价信息
  buyerRating: { type: Number, min: 1, max: 5 },
  sellerRating: { type: Number, min: 1, max: 5 },
  buyerComment: { type: String },
  sellerComment: { type: String }
});

module.exports = mongoose.model('Order', OrderSchema);
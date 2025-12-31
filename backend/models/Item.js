// 物品模型
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  // 基本信息
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  
  // 分类与标签
  category: { type: String, required: true },
  tags: [{ type: String }],
  
  // 物品状态
  condition: { type: String, required: true }, // 新旧程度
  status: { type: String, default: 'selling' }, // 出售状态
  
  // 图片信息
  images: [{ type: String }],
  
  // 地理位置
  location: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  
  // 发布者信息
  seller: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    avatar: { type: String }
  },
  
  // 统计信息
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // 系统信息
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', ItemSchema);
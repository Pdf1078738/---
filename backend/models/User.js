// 用户模型
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // 基本信息
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  studentId: { type: String, unique: true },
  
  // 个人资料
  avatar: { type: String },
  bio: { type: String },
  location: { type: String },
  phone: { type: String },
  
  // 系统信息
  role: { type: String, default: 'user' },
  creditScore: { type: Number, default: 100 },
  tradeCount: { type: Number, default: 0 },
  interests: [{ type: String }],
  
  // 时间信息
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

// 密码哈希中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密码验证方法
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
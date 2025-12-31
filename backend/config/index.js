// 全局配置
module.exports = {
  // 端口配置
  PORT: process.env.PORT || 3000,
  
  // JWT 配置
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key', // 实际部署时必须设置环境变量
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // 上传配置
  UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads/',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 5 * 1024 * 1024, // 5MB
  
  // 数据库配置
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/campus-trading'
}
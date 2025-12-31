// 辅助函数

// 生成唯一ID
exports.generateId = (prefix = '') => {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// 格式化日期
exports.formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 计算物品折扣
exports.calculateDiscount = (originalPrice, currentPrice) => {
  if (!originalPrice || originalPrice <= 0) return 0;
  const discount = Math.round((1 - currentPrice / originalPrice) * 100);
  return discount;
};

// 生成缩略图URL
exports.generateThumbnailUrl = (imageUrl) => {
  if (!imageUrl) return '';
  // 这里可以根据实际情况实现缩略图生成逻辑
  return imageUrl;
};

// 验证邮箱格式
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 验证手机号格式
exports.isValidPhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};
// 数据验证工具

// 验证用户注册数据
exports.validateRegisterData = (data) => {
  const errors = [];
  
  if (!data.username || data.username.length < 3) {
    errors.push('用户名长度不能少于3个字符');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('请输入有效的邮箱地址');
  }
  
  if (!data.password || data.password.length < 6) {
    errors.push('密码长度不能少于6个字符');
  }
  
  if (!data.name) {
    errors.push('请输入真实姓名');
  }
  
  if (!data.studentId) {
    errors.push('请输入学号');
  }
  
  return errors;
};

// 验证用户登录数据
exports.validateLoginData = (data) => {
  const errors = [];
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('请输入有效的邮箱地址');
  }
  
  if (!data.password) {
    errors.push('请输入密码');
  }
  
  return errors;
};

// 验证物品数据
exports.validateItemData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.length < 5) {
    errors.push('物品标题长度不能少于5个字符');
  }
  
  if (!data.description || data.description.length < 10) {
    errors.push('物品描述长度不能少于10个字符');
  }
  
  if (!data.price || data.price <= 0) {
    errors.push('请输入有效的价格');
  }
  
  if (!data.category) {
    errors.push('请选择物品分类');
  }
  
  if (!data.condition) {
    errors.push('请选择物品新旧程度');
  }
  
  if (!data.location) {
    errors.push('请输入交易地点');
  }
  
  return errors;
};

// 验证订单数据
exports.validateOrderData = (data) => {
  const errors = [];
  
  if (!data.itemId) {
    errors.push('缺少物品ID');
  }
  
  if (!data.sellerId) {
    errors.push('缺少卖家ID');
  }
  
  return errors;
};

// 验证消息数据
exports.validateMessageData = (data) => {
  const errors = [];
  
  if (!data.receiverId) {
    errors.push('缺少接收者ID');
  }
  
  if (!data.content || data.content.trim() === '') {
    errors.push('消息内容不能为空');
  }
  
  return errors;
};
// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // 默认错误状态码
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || '服务器内部错误',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
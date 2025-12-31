// 物品控制器
const Item = require('../models/Item');

// 创建物品
exports.createItem = async (req, res, next) => {
  try {
    const { title, description, price, originalPrice, category, condition, location } = req.body;
    const seller = req.user;
    
    // 处理图片上传
    const images = req.files?.map(file => file.path) || [];
    
    // 创建物品
    const item = await Item.create({
      title,
      description,
      price,
      originalPrice,
      category,
      condition,
      location,
      images,
      seller: {
        id: seller._id,
        name: seller.name,
        avatar: seller.avatar
      }
    });
    
    res.status(201).json({
      success: true,
      item
    });
  } catch (error) {
    next(error);
  }
};

// 获取所有物品
exports.getAllItems = async (req, res, next) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      items
    });
  } catch (error) {
    next(error);
  }
};

// 获取物品详情
exports.getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 查找物品
    const item = await Item.findById(id);
    
    if (!item) {
      res.status(404);
      throw new Error('物品不存在');
    }
    
    // 增加浏览量
    item.views += 1;
    await item.save();
    
    res.json({
      success: true,
      item
    });
  } catch (error) {
    next(error);
  }
};

// 更新物品
exports.updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = req.user;
    
    // 查找物品
    const item = await Item.findById(id);
    
    if (!item) {
      res.status(404);
      throw new Error('物品不存在');
    }
    
    // 检查是否是物品的发布者
    if (item.seller.id.toString() !== user._id.toString()) {
      res.status(403);
      throw new Error('无权修改此物品');
    }
    
    // 处理图片上传
    if (req.files?.length) {
      updates.images = req.files.map(file => file.path);
    }
    
    // 更新物品信息
    Object.assign(item, updates);
    await item.save();
    
    res.json({
      success: true,
      item
    });
  } catch (error) {
    next(error);
  }
};

// 删除物品
exports.deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // 查找物品
    const item = await Item.findById(id);
    
    if (!item) {
      res.status(404);
      throw new Error('物品不存在');
    }
    
    // 检查是否是物品的发布者
    if (item.seller.id.toString() !== user._id.toString()) {
      res.status(403);
      throw new Error('无权删除此物品');
    }
    
    // 删除物品
    await item.deleteOne();
    
    res.json({
      success: true,
      message: '物品删除成功'
    });
  } catch (error) {
    next(error);
  }
};

// 搜索物品
exports.searchItems = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      res.status(400);
      throw new Error('搜索关键词不能为空');
    }
    
    // 关键词搜索
    const items = await Item.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [keyword] } }
      ]
    });
    
    res.json({
      success: true,
      items
    });
  } catch (error) {
    next(error);
  }
};

// 筛选物品
exports.filterItems = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, sortBy } = req.query;
    
    // 构建查询条件
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    
    // 构建排序条件
    let sortOptions = {};
    switch (sortBy) {
      case 'price-asc':
        sortOptions.price = 1;
        break;
      case 'price-desc':
        sortOptions.price = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'popular':
        sortOptions.views = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }
    
    // 筛选物品
    const items = await Item.find(query).sort(sortOptions);
    
    res.json({
      success: true,
      items
    });
  } catch (error) {
    next(error);
  }
};
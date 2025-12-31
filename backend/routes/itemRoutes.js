// 物品路由
const express = require('express');
const router = express.Router();
const { 
  createItem, 
  getAllItems, 
  getItemById, 
  updateItem, 
  deleteItem,
  searchItems,
  filterItems
} = require('../controllers/itemController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// 创建物品
router.post('/', auth, upload.array('images', 5), createItem);

// 获取所有物品
router.get('/', getAllItems);

// 获取物品详情
router.get('/:id', getItemById);

// 更新物品
router.put('/:id', auth, upload.array('images', 5), updateItem);

// 删除物品
router.delete('/:id', auth, deleteItem);

// 搜索物品
router.get('/search', searchItems);

// 筛选物品
router.get('/filter', filterItems);

module.exports = router;
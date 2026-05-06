// routes/order.routes.js
const express = require('express')
const router = express.Router()
const { createOrder, getOrderById, getOrders, updateOrderStatus } = require('../controllers/products.controller')
const authMiddleware = require('../middlewares/auth.middleware') // ✅ your existing one

router.route('/').post(authMiddleware, createOrder).get(authMiddleware, getOrders)
router.route('/:id').get(authMiddleware, getOrderById).put(authMiddleware, updateOrderStatus)

module.exports = router 
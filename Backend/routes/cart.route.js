const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateQuantity, removeFromCart,clearCart } = require('../controllers/cart.controller');
const protect = require('../middlewares/auth.middleware'); // your existing JWT middleware

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.patch('/update', protect, updateQuantity);
router.delete('/remove/:productId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

module.exports = router;
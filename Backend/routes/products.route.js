const express = require('express');
const router = express.Router();
const productController = require('../controllers/products.controller');
const { body } = require('express-validator');

router.route("/")
.get(productController.getAllProducts)
.post([
  body('name').isLength({min:3}).withMessage('Name must be at least 3 characters long'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('description').isLength({min:10}).withMessage('Description must be at least 10 characters long'),
body('category').isIn(['mobile-accessories','gadgets']).withMessage('Invalid category'),
  body('stock').isInt({min:0}).withMessage('Stock must be a non-negative integer')
],
productController.createProduct);

router.route("/:slug-:id").get(productController.getProductById);

router.route("/:id").put([
  body('name').isLength({min:3}).withMessage('Name must be at least 3 characters long'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('description').isLength({min:10}).withMessage('Description must be at least 10 characters long'),
body('category').isIn(['mobile-accessories','gadgets']).withMessage('Invalid category'),
  body('stock').isInt({min:0}).withMessage('Stock must be a non-negative integer')
],
productController.updateProduct);

router.route("/category/:category").get(productController.getProductsByCategory);

module.exports = router;
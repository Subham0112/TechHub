const Product = require("../models/products.model");
const Order = require("../models/productOrder.model");
const { validationResult } = require("express-validator");
const slugify = require("slugify");
    
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error("Error getting products:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
};

const createProduct= async (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.status(400).json({ errors: validationResult(req).array() });
    }
const { name, price, description, image, category,type, stock} = req.body;
    try {
        const slug = slugify(name, { lower: true, strict: true });
        const product = await Product.create({
            name,
            price,
            description,
            slug,
            image,
            category,
            type,
            stock,
        });
        res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
};


const getProductById = async (req, res) => {
    try {
        const product= await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error getting product by ID:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
}

const updateProduct = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.status(400).json({ errors: validationResult(req).array() });
    }
    const { name, price, description, image, category, type, stock } = req.body;
    try {
        const slug = slugify(name, { lower: true, strict: true });
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                price,
                description,
                slug,
                image,
                category,
                type,
                stock,
            },
            { new: true }
        );
        res.status(200).json(product);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
};
const createOrder = async (req, res) => {
  try {
    const { items, totalPrice, shippingAddress } = req.body

    // items = [{ productId, quantity, price, subtotal }, ...]
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' })
    }

    const order = await Order.create({
      userId: req.user._id,
      items,
      totalPrice,
      shippingAddress,
    })

    res.status(201).json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ message: 'Server error, please try again later' })
  }
}

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.status(200).json(order)
  } catch (error) {
    console.error('Error getting order by ID:', error)
    res.status(500).json({ message: 'Server error, please try again later' })
  }
}

// In your controller
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')              // ✅ get customer name
      .populate('items.productId', 'name image')     // ✅ get product names
      .sort({ createdAt: -1 })                       // newest first
    res.status(200).json(orders)
  } catch (error) {
    console.error("Error getting orders:", error)
    res.status(500).json({ message: "Server error, please try again later" })
  }
}

const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, {
            orderStatus: req.body.orderStatus
        }, { new: true })
        res.status(200).json(order)
    } catch (error) {
        console.error('Error updating order status:', error)
        res.status(500).json({ message: 'Server error, please try again later' })
    }
}

module.exports = {
    getAllProducts,
    createProduct,
    getProductById,
    updateProduct,
    createOrder,
    getOrderById,
    getOrders,
    updateOrderStatus,
};
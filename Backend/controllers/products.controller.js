const Product = require("../models/products.model");
const Order = require("../models/productOrder.model");
const { validationResult } = require("express-validator");
const slugify = require("slugify");
const path = require("path");
const fs = require("fs");
    
const getAllProducts = async (req, res) => {
    try {
        const query = {};

        if (req.query.search) {
            const search = req.query.search.trim();
            if (search.length) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                    { type: { $regex: search, $options: 'i' } },
                ];
            }
        }

        const products = await Product.find(query);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error getting products:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
};

const createProduct = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.status(400).json({ errors: validationResult(req).array() });
    }
    const { name, price, description, category, type, stock } = req.body;
    try {
        const slug = slugify(name, { lower: true, strict: true });
        const image = req.file ? `/uploads/${req.file.filename}` : "";

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

// controllers/products.controller.js — add this

const getProductSuggestions = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(200).json([]);

    const regex = new RegExp(q, 'i');
    const matches = await Product.find({
      $or: [
        { name: { $regex: regex } },
        { category: { $regex: regex } },
        { type: { $regex: regex } },
      ]
    }).select('name').limit(30);

    // Dedupe case-insensitively, cap at 8 suggestions
    const seen = new Set();
    const suggestions = [];
    for (const p of matches) {
      const key = p.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        suggestions.push(p.name);
      }
      if (suggestions.length >= 8) break;
    }

    res.status(200).json(suggestions);
  } catch (error) {
    console.error("Error getting product suggestions:", error);
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
const getProductsByCategory = async (req, res) => {
    const {category} = req.params;
    console.log("Category received:", category); // Debugging line
    try{
        const products=await Product.find({ category: category });
        if(!products || products.length === 0) {
            return res.status(404).json({ message: "No products found in this category" });
        }
        res.status(200).json(products);
    }catch(error){
        console.log("Error getting products by category:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
}


const updateProduct = async (req, res) => {
    if (!validationResult(req).isEmpty()) {
        return res.status(400).json({ errors: validationResult(req).array() });
    }
    const { name, price, description, category, type, stock } = req.body;
    try {
        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        const slug = slugify(name, { lower: true, strict: true });
        let image = existingProduct.image;

        if (req.file) {
            if (existingProduct.image && existingProduct.image.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '..', existingProduct.image);
                fs.unlink(oldPath, (err) => {
                    if (err) console.error("Error deleting old image:", err);
                });
            }
            image = `/uploads/${req.file.filename}`;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, price, description, slug, image, category, type, stock },
            { new: true }
        );
        res.status(200).json(product);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
};
const createOrder = async (req, res) => {
  try {
    const { items, totalPrice, shippingAddress, paymentMethod } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' })
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' })
    }

    const order = await Order.create({
      userId: req.user._id,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod,
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
      .populate('userId', 'name email')              
      .populate('items.productId', 'name image')     
      .sort({ createdAt: -1 })                      
    res.status(200).json(orders)
  } catch (error) {
    console.error("Error getting orders:", error)
    res.status(500).json({ message: "Server error, please try again later" })
  }
}

const updateOrderStatus = async (req, res) => {
    try {
        const updateFields = {}
        if (req.body.orderStatus)   updateFields.orderStatus = req.body.orderStatus
        if (req.body.paymentStatus) updateFields.paymentStatus = req.body.paymentStatus

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        )
        res.status(200).json(order)
    } catch (error) {
        console.error('Error updating order status:', error)
        res.status(500).json({ message: 'Server error, please try again later' })
    }
}

module.exports = {
    getAllProducts,
    createProduct,
    getProductSuggestions,
    getProductById,
    updateProduct,
    getProductsByCategory,
    createOrder,
    getOrderById,
    getOrders,
    updateOrderStatus,
    deleteProduct
};
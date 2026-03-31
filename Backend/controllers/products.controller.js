const Product = require("../models/products.model");
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

module.exports = {
    getAllProducts,
    createProduct,
    getProductById,
};
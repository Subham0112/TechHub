import { Request, Response } from "express";
import Product from "../models/products.model";
import Order, { IOrderItem } from "../models/productOrder.model";
import { validationResult } from "express-validator";
import slugify from "slugify";
import path from "path";
import fs from "fs";

// Escape regex metacharacters so search terms containing (), [], ., *, etc.
// are treated as literal text instead of breaking or hijacking the regex.
const escapeRegExp = (string: string): string =>
  string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAllProducts = async (req: Request, res: Response) => {
  try {
    const query: Record<string, unknown> = {};

    if (req.query.search) {
      const search = (req.query.search as string).trim();
      if (search.length) {
        const safe = escapeRegExp(search);
        query.$or = [
          { name: { $regex: safe, $options: "i" } },
          { category: { $regex: safe, $options: "i" } },
          { type: { $regex: safe, $options: "i" } },
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

const createProduct = async (req: Request, res: Response) => {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).json({ errors: validationResult(req).array() });
  }
  const { name, price, description, category, type, stock } = req.body as {
    name: string;
    price: number;
    description: string;
    category: string;
    type: string;
    stock: number;
  };
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

const getProductSuggestions = async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || "").trim();
    if (!q) return res.status(200).json([]);

    const safe = escapeRegExp(q);
    const regex = new RegExp(safe, "i");
    const matches = await Product.find({
      $or: [
        { name: { $regex: regex } },
        { category: { $regex: regex } },
        { type: { $regex: regex } },
      ],
    }).select("name").limit(30);

    const seen = new Set<string>();
    const suggestions: string[] = [];
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

const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error getting product by ID:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getProductsByCategory = async (req: Request, res: Response) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category: category });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found in this category" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.log("Error getting products by category:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).json({ errors: validationResult(req).array() });
  }
  const { name, price, description, category, type, stock } = req.body as {
    name: string;
    price: number;
    description: string;
    category: string;
    type: string;
    stock: number;
  };
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const slug = slugify(name, { lower: true, strict: true });
    let image = existingProduct.image;

    if (req.file) {
      if (existingProduct.image && existingProduct.image.startsWith("/uploads/")) {
        const oldPath = path.join(__dirname, "..", existingProduct.image);
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

const deleteProduct = async (req: Request, res: Response) => {
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

const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, totalPrice, shippingAddress, paymentMethod } = req.body as {
      items: IOrderItem[];
      totalPrice: number;
      shippingAddress: string;
      paymentMethod: "esewa" | "khalti" | "cod";
    };

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    const order = await Order.create({
      userId: req.user?._id,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Error getting order by ID:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getOrders = async (req: Request, res: Response) => {
  try {
    const query = req.user?.role === "admin" ? {} : { userId: req.user?._id };
    const orders = await Order.find(query)
      .populate("userId", "name email")
      .populate("items.productId", "name image")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const updateFields: Record<string, unknown> = {};
    if (req.body.orderStatus) updateFields.orderStatus = req.body.orderStatus;
    if (req.body.paymentStatus) updateFields.paymentStatus = req.body.paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export {
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
  deleteProduct,
};

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import slugify from "slugify";
import path from "path";
import fs from "fs";
import { prisma } from "../config/prisma";
import type { Order, OrderItem, Product, User } from "../../generated/prisma/client";

export const productToClient = (p: Product) => ({ ...p, _id: String(p.id) });

export const orderToClient = (o: Order & { user?: Pick<User, "id" | "name" | "email"> | null; items?: (OrderItem & { product?: Pick<Product, "id" | "name" | "image"> | null })[] }) => {
  const { user, items, ...rest } = o;
  return {
    ...rest,
    _id: String(o.id),
    userId: user
      ? { _id: String(user.id), name: user.name, email: user.email }
      : String(o.userId),
    items: (items ?? []).map((i) => ({
      ...i,
      _id: String(i.id),
      productId: i.product
        ? { _id: String(i.product.id), name: i.product.name, image: i.product.image }
        : String(i.productId ?? ""),
    })),
  };
};

const getAllProducts = async (req: Request, res: Response) => {
  try {
    const where: Record<string, unknown> = {};

    if (req.query.search) {
      const search = (req.query.search as string).trim();
      if (search.length) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
          { type: { contains: search, mode: "insensitive" } },
        ];
      }
    }

    const products = await prisma.product.findMany({ where });
    res.status(200).json(products.map(productToClient));
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

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        description,
        slug,
        image,
        category,
        type,
        stock: Number(stock),
      },
    });
    res.status(201).json(productToClient(product));
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getProductSuggestions = async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || "").trim();
    if (!q) return res.status(200).json([]);

    const matches = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { type: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { name: true },
      take: 30,
    });

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
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Product not found" });
    }
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(productToClient(product));
  } catch (error) {
    console.error("Error getting product by ID:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getProductsByCategory = async (req: Request, res: Response) => {
  const { category } = req.params;
  try {
    const products = await prisma.product.findMany({ where: { category: String(category) } });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found in this category" });
    }
    res.status(200).json(products.map(productToClient));
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
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Product not found" });
    }
    const existingProduct = await prisma.product.findUnique({ where: { id } });
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

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: Number(price),
        description,
        slug,
        image,
        category,
        type,
        stock: Number(stock),
      },
    });
    res.status(200).json(productToClient(product));
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Product not found" });
    }
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await prisma.product.delete({ where: { id } });
    res.status(200).json(productToClient(product));
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

// Order statuses from which an order can still be cancelled (stock gets restored).
const CANCELLABLE_FROM = ["pending", "accepted", "preparing"];
const NON_CANCELLABLE_MESSAGE =
  "Order can no longer be cancelled once it is on the way";

const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, totalPrice, shippingAddress, paymentMethod } = req.body as {
      items: { productId: string; quantity: number; price: number; subtotal: number }[];
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

    const normalizedItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    }));

    if (
      normalizedItems.some(
        (i) =>
          !Number.isInteger(i.productId) ||
          i.productId <= 0 ||
          !Number.isInteger(i.quantity) ||
          i.quantity <= 0
      )
    ) {
      return res.status(400).json({ message: "Invalid order items" });
    }

    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        // Verify stock availability before reserving anything.
        for (const item of normalizedItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, stock: true },
          });
          if (!product) {
            throw new Error(`Product not found (id ${item.productId})`);
          }
          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for "${product.name}" (only ${product.stock} left)`
            );
          }
        }

        // Atomically decrement stock (guards against overselling under concurrency).
        for (const item of normalizedItems) {
          const result = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (result.count !== 1) {
            throw new Error("Insufficient stock, please try again");
          }
        }

        return tx.order.create({
          data: {
            userId: req.user?.id as number,
            totalPrice,
            shippingAddress,
            paymentMethod,
            items: { create: normalizedItems },
          },
          include: {
            items: {
              include: { product: { select: { id: true, name: true, image: true } } },
            },
          },
        });
      });
    } catch (txError) {
      return res.status(400).json({ message: (txError as Error).message });
    }

    res.status(201).json(orderToClient(order));
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Order not found" });
    }
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: { select: { id: true, name: true, image: true } } },
        },
      },
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(orderToClient(order));
  } catch (error) {
    console.error("Error getting order by ID:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const getOrders = async (req: Request, res: Response) => {
  try {
    const where = req.user?.role === "admin" ? {} : { userId: req.user?.id };
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: { select: { id: true, name: true, image: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(orders.map(orderToClient));
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Order not found" });
    }
    const data: { orderStatus?: string; paymentStatus?: string } = {};
    if (req.body.orderStatus) data.orderStatus = req.body.orderStatus;
    if (req.body.paymentStatus) data.paymentStatus = req.body.paymentStatus;

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) {
      return res.status(404).json({ message: "Order not found" });
    }

    const current = existing.orderStatus;
    const next = data.orderStatus ?? current;

    // Cancelling is only allowed while the order is still being prepared.
    if (next === "cancelled" && current !== "cancelled") {
      if (!CANCELLABLE_FROM.includes(current)) {
        return res
          .status(400)
          .json({ message: NON_CANCELLABLE_MESSAGE });
      }

      let order;
      try {
        order = await prisma.$transaction(async (tx) => {
          // Restore the stock that was reserved when the order was placed.
          for (const item of existing.items) {
            if (item.productId !== null) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
          return tx.order.update({ where: { id }, data });
        });
      } catch (txError) {
        return res.status(400).json({ message: (txError as Error).message });
      }
      return res.status(200).json(orderToClient(order));
    }

    // Re-activating a cancelled order reserves the stock again.
    if (current === "cancelled" && next !== "cancelled") {
      let order;
      try {
        order = await prisma.$transaction(async (tx) => {
          for (const item of existing.items) {
            if (item.productId !== null) {
              const result = await tx.product.updateMany({
                where: { id: item.productId, stock: { gte: item.quantity } },
                data: { stock: { decrement: item.quantity } },
              });
              if (result.count !== 1) {
                throw new Error(
                  "Insufficient stock to reactivate this order"
                );
              }
            }
          }
          return tx.order.update({ where: { id }, data });
        });
      } catch (txError) {
        return res.status(400).json({ message: (txError as Error).message });
      }
      return res.status(200).json(orderToClient(order));
    }

    const order = await prisma.order.update({
      where: { id },
      data,
    });
    res.status(200).json(orderToClient(order));
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

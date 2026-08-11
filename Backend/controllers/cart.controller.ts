import { Request, Response } from "express";
import Cart from "../models/cart.model";
import Product from "../models/products.model";

// GET /cart — fetch current user's cart
const getCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.user?._id }).populate("items.productId");

    if (!cart) return res.json({ items: [] });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// POST /cart/add — add item or increment quantity
const addToCart = async (req: Request, res: Response) => {
  const { productId } = req.body as { productId: string };

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ userId: req.user?._id });

    if (!cart) {
      // First time — create cart
      cart = new Cart({
        userId: req.user?._id,
        items: [{ productId, quantity: 1 }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        // Already in cart — bump quantity
        existingItem.quantity += 1;
      } else {
        cart.items.push({ productId: productId as unknown as typeof cart.items[number]["productId"], quantity: 1 });
      }
    }

    await cart.save();
    await cart.populate("items.productId");

    res.json({ message: "Added to cart", cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

// PATCH /cart/update — change quantity of an item
const updateQuantity = async (req: Request, res: Response) => {
  const { productId, quantity } = req.body as { productId: string; quantity: number };

  try {
    const cart = await Cart.findOne({ userId: req.user?._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((item) => item.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    if (quantity <= 0) {
      // Remove if quantity hits 0
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate("items.productId");

    res.json({ message: "Cart updated", cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to update cart" });
  }
};

// DELETE /cart/remove/:productId — remove item entirely
const removeFromCart = async (req: Request, res: Response) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: req.user?._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

    await cart.save();
    await cart.populate("items.productId");

    res.json({ message: "Item removed", cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item" });
  }
};

const clearCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.user?._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];

    await cart.save();
    await cart.populate("items.productId");

    res.json({ message: "Cart cleared", cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart" });
  }
};

export { getCart, addToCart, updateQuantity, removeFromCart, clearCart };

import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import type { Cart, CartItem, Product } from "../../generated/prisma/client";

type CartWithItems = Cart & {
  items: (CartItem & { product?: Pick<Product, "id" | "name" | "price" | "description" | "slug" | "image" | "category" | "type" | "stock"> | null })[];
};

const cartToClient = (cart: CartWithItems) => ({
  ...cart,
  _id: String(cart.id),
  items: cart.items.map((item) => ({
    ...item,
    _id: String(item.id),
    // keep the mongoose-style populated shape the frontend expects
    productId: item.product
      ? { ...item.product, _id: String(item.product.id) }
      : String(item.productId),
  })),
});

// GET /cart — fetch current user's cart
const getCart = async (req: Request, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user?.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart) return res.json({ items: [] });

    res.json(cartToClient(cart));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// POST /cart/add — add item or increment quantity
const addToCart = async (req: Request, res: Response) => {
  const { productId } = req.body as { productId: string };

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await prisma.cart.findUnique({ where: { userId: req.user?.id } });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.user?.id as number,
          items: { create: { productId: product.id, quantity: 1 } },
        },
      });
    } else {
      await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId: product.id } },
        create: { cartId: cart.id, productId: product.id, quantity: 1 },
        update: { quantity: { increment: 1 } },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user?.id },
      include: { items: { include: { product: true } } },
    });

    res.json({ message: "Added to cart", cart: updatedCart ? cartToClient(updatedCart) : null });
  } catch (err) {
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

// PATCH /cart/update — change quantity of an item
const updateQuantity = async (req: Request, res: Response) => {
  const { productId, quantity } = req.body as { productId: string; quantity: number };

  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user?.id } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: Number(productId) } },
    });
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { cartId_productId: { cartId: cart.id, productId: Number(productId) } },
      });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user?.id },
      include: { items: { include: { product: true } } },
    });

    res.json({ message: "Cart updated", cart: cartToClient(updatedCart as CartWithItems) });
  } catch (err) {
    res.status(500).json({ message: "Failed to update cart" });
  }
};

// DELETE /cart/remove/:productId — remove item entirely
const removeFromCart = async (req: Request, res: Response) => {
  const { productId } = req.params;

  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user?.id } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId: Number(productId) },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user?.id },
      include: { items: { include: { product: true } } },
    });

    res.json({ message: "Item removed", cart: cartToClient(updatedCart as CartWithItems) });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item" });
  }
};

const clearCart = async (req: Request, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user?.id } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user?.id },
      include: { items: { include: { product: true } } },
    });

    res.json({ message: "Cart cleared", cart: cartToClient(updatedCart as CartWithItems) });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart" });
  }
};

export { getCart, addToCart, updateQuantity, removeFromCart, clearCart };

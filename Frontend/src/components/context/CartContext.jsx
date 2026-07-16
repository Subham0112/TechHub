import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading: userLoading } = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setCartItems([]);
      setCartLoading(false);
      return;
    }

    const fetchCart = async () => {
      setCartLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/cart`);
        setCartItems(res.data.items || []);
      } catch (err) {
        console.error('Cart fetch error:', err);
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, [user, userLoading]);

  const addToCart = async (product) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/cart/add`, {
        productId: product._id
      });
      setCartItems(res.data.cart.items);
      showToast(`${product.name} added to cart!`);
    } catch (err) {
      showToast('Failed to add item. Please login.', 'error');
      console.error('Add to cart error:', err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await axios.patch(`${import.meta.env.VITE_API_URL}/cart/update`, {
        productId,
        quantity
      });
      setCartItems(res.data.cart.items);
    } catch (err) {
      showToast('Failed to update quantity.', 'error');
      console.error('Update cart error:', err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/cart/remove/${productId}`
      );
      setCartItems(res.data.cart.items);
      showToast('Item removed from cart.');
    } catch (err) {
      showToast('Failed to remove item.', 'error');
      console.error('Remove from cart error:', err);
    }
  };

  // Empty the entire cart — used after a successful checkout
  const clearCart = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/cart/clear`);
      setCartItems([]);
    } catch (err) {
      console.error('Clear cart error:', err);
      throw err; // let the caller (CheckoutPage) decide how to handle this
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, cartCount, cartLoading, addToCart, updateQuantity, removeFromCart, clearCart, toast }}
    >
      {children}
    </CartContext.Provider>
  );
};
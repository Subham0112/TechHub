import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [toast, setToast] = useState(null); 

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user) {
      setCartItems([]);
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
  }, [user]);

  const addToCart = async (product) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/cart/add`, {
        productId: product._id
      });
      setCartItems(res.data.cart.items);
      showToast(`${product.name} added to cart!`);
    } catch (err) {
      showToast('Failed to add item. Please login.', 'error');
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
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, cartCount, cartLoading, addToCart, updateQuantity, removeFromCart, toast }}
    >
      {children}
    </CartContext.Provider>
  );
};
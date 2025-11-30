import React, { createContext, useEffect, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || { items: [] };
    } catch (e) {
      return { items: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const items = [...prev.items];
      const idx = items.findIndex(i => i.product._id === product._id);
      if (idx >= 0) items[idx].quantity += qty;
      else items.push({ _id: Date.now().toString(), product, quantity: qty });
      return { items };
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => ({ items: prev.items.filter(i => i._id !== itemId) }));
  };

  const clearCart = () => setCart({ items: [] });

  const totalItems = cart.items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

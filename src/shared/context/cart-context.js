'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

const STORAGE_KEY = 'cage3000_cart_v1';

function readStoredCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drop malformed entries so a corrupt localStorage value doesn't crash render.
    return parsed.filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        item.id !== undefined &&
        Number.isFinite(item.quantity)
    );
  } catch {
    return [];
  }
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount to keep SSR markup stable.
  useEffect(() => {
    setCart(readStoredCart());
    setHydrated(true);
  }, []);

  // Persist on every change, but only after hydration so we don't overwrite
  // stored cart with the empty initial state.
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Quota / private-mode failures are non-fatal.
    }
  }, [cart, hydrated]);

  // Sync cart across tabs in the same browser.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      setCart(readStoredCart());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addToCart = (item, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, addToCart, removeFromCart, updateQuantity, clearCart, hydrated }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

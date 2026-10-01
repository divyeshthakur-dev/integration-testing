'use client';

import { createContext, useContext, useState, useEffect, useCallback, startTransition, ReactNode } from 'react';
import { CartItem, Product } from './types';
import { useAuth } from './AuthContext';
import api from './api';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ─── Helpers ────────────────────────────────────────────────────────────────

/** localStorage key is scoped to the user — different users never share a key */
const storageKey = (userId: string) => `shopCart_${userId}`;

/** Normalise the backend cart response into the CartItem[] shape the UI uses */
function normaliseItems(backendItems: Array<{ product: Product; quantity: number }>): CartItem[] {
  return backendItems
    .filter((i) => i.product) // drop items whose product was deleted
    .map((i) => ({ product: i.product, quantity: i.quantity }));
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // ── Persist to localStorage (always scoped by userId) ──────────────────
  const persist = useCallback(
    (items: CartItem[]) => {
      if (user) {
        localStorage.setItem(storageKey(user._id), JSON.stringify(items));
      }
      setCartItems(items);
    },
    [user]
  );

  // ── On auth change: load the correct cart ──────────────────────────────
  useEffect(() => {
    if (!user) {
      // Logged out — wipe in-memory cart; do NOT touch any user-specific localStorage keys
      startTransition(() => setCartItems([]));
      return;
    }

    // 1. Immediately restore from this user's localStorage (instant UI)
    const localRaw = localStorage.getItem(storageKey(user._id));
    const localItems: CartItem[] = localRaw ? JSON.parse(localRaw) : [];

    // 2. Fetch the authoritative cart from the backend (keyed by JWT → userId)
    const syncWithBackend = async () => {
      try {
        if (localItems.length > 0) {
          // Push local items → server (merge/overwrite the server cart)
          const syncPayload = localItems.map((i) => ({
            productId: i.product._id,
            quantity: i.quantity,
          }));
          const { data } = await api.put('/cart/sync', { items: syncPayload });
          const synced = normaliseItems(data.data.items ?? []);
          persist(synced);
        } else {
          // No local items — just pull from server
          const { data } = await api.get('/cart');
          const serverItems = normaliseItems(data.data.items ?? []);
          persist(serverItems);
        }
      } catch {
        // Backend unreachable — fall back to local cache
        persist(localItems);
      }
    };

    startTransition(() => setCartItems(localItems)); // show local immediately
    syncWithBackend();        // then reconcile with server
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]); // re-run only when the logged-in user changes

  // ── Cart mutations ─────────────────────────────────────────────────────

  const addToCart = useCallback(
    async (product: Product, quantity = 1) => {
      // Optimistic update
      const existing = cartItems.find((i) => i.product._id === product._id);
      const updated = existing
        ? cartItems.map((i) =>
            i.product._id === product._id
              ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
              : i
          )
        : [...cartItems, { product, quantity: Math.min(quantity, product.stock) }];

      persist(updated);

      // Persist to backend if authenticated
      if (isAuthenticated) {
        try {
          const { data } = await api.post('/cart', { productId: product._id, quantity });
          persist(normaliseItems(data.data.items ?? []));
        } catch {
          // Keep optimistic state on failure
        }
      }
    },
    [cartItems, isAuthenticated, persist]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      persist(cartItems.filter((i) => i.product._id !== productId));

      if (isAuthenticated) {
        try {
          const { data } = await api.delete(`/cart/${productId}`);
          persist(normaliseItems(data.data.items ?? []));
        } catch { /* keep optimistic */ }
      }
    },
    [cartItems, isAuthenticated, persist]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      persist(
        cartItems.map((i) =>
          i.product._id === productId
            ? { ...i, quantity: Math.min(quantity, i.product.stock) }
            : i
        )
      );

      if (isAuthenticated) {
        try {
          const { data } = await api.put(`/cart/${productId}`, { quantity });
          persist(normaliseItems(data.data.items ?? []));
        } catch { /* keep optimistic */ }
      }
    },
    [cartItems, isAuthenticated, persist, removeFromCart]
  );

  const clearCart = useCallback(async () => {
    if (user) {
      localStorage.removeItem(storageKey(user._id));
    }
    setCartItems([]);

    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch { /* best-effort */ }
    }
  }, [user, isAuthenticated]);

  // ── Derived totals ─────────────────────────────────────────────────────
  const cartCount    = cartItems.reduce((s, i) => s + i.quantity, 0);
  const itemsPrice   = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shippingPrice = itemsPrice > 1000 ? 0 : 99;
  const taxPrice     = Math.round(itemsPrice * 0.18);
  const totalPrice   = itemsPrice + shippingPrice + taxPrice;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

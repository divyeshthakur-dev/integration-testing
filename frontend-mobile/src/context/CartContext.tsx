import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from '../hooks/useAuth';
import { appStorage } from '../utils/storage';
import cartApi, { BackendCartResponse } from '../api/cart';

export interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

const storageKey = (userId?: string) => `shopCart_${userId || 'guest'}`;

function normaliseBackendItems(backendItems: BackendCartResponse['items']): CartItem[] {
  if (!Array.isArray(backendItems)) return [];
  return backendItems
    .filter((item) => item.product && typeof item.product === 'object' && item.product._id)
    .map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Persist items to AsyncStorage scoped by user
  const persistItems = useCallback(
    async (items: CartItem[]) => {
      setCartItems(items);
      const key = storageKey(user?._id);
      await appStorage.setItem(key, JSON.stringify(items));
    },
    [user?._id]
  );

  // Sync / pull cart from backend or local storage
  const syncWithBackend = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const key = storageKey(user?._id);
      const localRaw = await appStorage.getItem(key);
      const localItems: CartItem[] = localRaw ? JSON.parse(localRaw) : [];

      if (localItems.length > 0) {
        // Sync local items to server
        const syncPayload = localItems.map((i) => ({
          productId: i.product._id,
          quantity: i.quantity,
        }));
        const response = await cartApi.syncCart(syncPayload);
        if (response.success && response.data) {
          const synced = normaliseBackendItems(response.data.items);
          await persistItems(synced);
        }
      } else {
        // Fetch authoritative cart from server
        const response = await cartApi.getCart();
        if (response.success && response.data) {
          const fetched = normaliseBackendItems(response.data.items);
          await persistItems(fetched);
        }
      }
    } catch (e) {
      console.warn('Cart backend sync failed, using local items', e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?._id, persistItems]);

  // Handle auth change: load user-scoped cart
  useEffect(() => {
    let isMounted = true;

    const loadInitialCart = async () => {
      if (!user) {
        // Logged out
        setCartItems([]);
        return;
      }

      // 1. Instant UI from user cache
      const key = storageKey(user._id);
      const localRaw = await appStorage.getItem(key);
      if (localRaw && isMounted) {
        try {
          const parsed = JSON.parse(localRaw);
          setCartItems(parsed);
        } catch {
          // ignore corrupted local JSON
        }
      }

      // 2. Reconcile with MongoDB backend
      await syncWithBackend();
    };

    loadInitialCart();

    return () => {
      isMounted = false;
    };
  }, [user?._id, syncWithBackend]);

  // Add to cart with optimistic update + backend persist
  const addToCart = useCallback(
    async (product: Product, quantity = 1) => {
      const existing = cartItems.find((i) => i.product._id === product._id);
      const updated = existing
        ? cartItems.map((i) =>
            i.product._id === product._id
              ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
              : i
          )
        : [...cartItems, { product, quantity: Math.min(quantity, product.stock) }];

      await persistItems(updated);

      if (isAuthenticated) {
        try {
          const res = await cartApi.addToCart(product._id, quantity);
          if (res.success && res.data) {
            await persistItems(normaliseBackendItems(res.data.items));
          }
        } catch (e) {
          console.warn('Backend addToCart failed, kept optimistic state', e);
        }
      }
    },
    [cartItems, isAuthenticated, persistItems]
  );

  // Remove from cart
  const removeFromCart = useCallback(
    async (productId: string) => {
      const updated = cartItems.filter((i) => i.product._id !== productId);
      await persistItems(updated);

      if (isAuthenticated) {
        try {
          const res = await cartApi.removeFromCart(productId);
          if (res.success && res.data) {
            await persistItems(normaliseBackendItems(res.data.items));
          }
        } catch (e) {
          console.warn('Backend removeFromCart failed, kept optimistic state', e);
        }
      }
    },
    [cartItems, isAuthenticated, persistItems]
  );

  // Update quantity
  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      const updated = cartItems.map((i) =>
        i.product._id === productId
          ? { ...i, quantity: Math.min(quantity, i.product.stock) }
          : i
      );
      await persistItems(updated);

      if (isAuthenticated) {
        try {
          const res = await cartApi.updateQuantity(productId, quantity);
          if (res.success && res.data) {
            await persistItems(normaliseBackendItems(res.data.items));
          }
        } catch (e) {
          console.warn('Backend updateQuantity failed, kept optimistic state', e);
        }
      }
    },
    [cartItems, isAuthenticated, persistItems, removeFromCart]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    const key = storageKey(user?._id);
    await appStorage.removeItem(key);
    setCartItems([]);

    if (isAuthenticated) {
      try {
        await cartApi.clearCart();
      } catch (e) {
        console.warn('Backend clearCart failed', e);
      }
    }
  }, [user?._id, isAuthenticated]);

  // Derived financial totals matching web business logic
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const itemsPrice = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const shippingPrice = itemsPrice > 1000 ? 0 : itemsPrice === 0 ? 0 : 99;
  const taxPrice = Math.round(itemsPrice * 0.18);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: syncWithBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

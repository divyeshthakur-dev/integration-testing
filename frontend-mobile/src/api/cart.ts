import apiClient from './client';
import { ApiResponse, CartItem, Product } from '../types';

export interface BackendCartResponse {
  _id?: string;
  user?: string;
  items: Array<{
    product: Product;
    quantity: number;
  }>;
}

export const cartApi = {
  // Fetch logged in user's cart
  async getCart(): Promise<ApiResponse<BackendCartResponse>> {
    const response = await apiClient.get<ApiResponse<BackendCartResponse>>('/api/cart');
    return response.data;
  },

  // Add or increment item in cart
  async addToCart(productId: string, quantity = 1): Promise<ApiResponse<BackendCartResponse>> {
    const response = await apiClient.post<ApiResponse<BackendCartResponse>>('/api/cart', {
      productId,
      quantity,
    });
    return response.data;
  },

  // Update item quantity (0 removes item)
  async updateQuantity(productId: string, quantity: number): Promise<ApiResponse<BackendCartResponse>> {
    const response = await apiClient.put<ApiResponse<BackendCartResponse>>(`/api/cart/${productId}`, {
      quantity,
    });
    return response.data;
  },

  // Remove single item from cart
  async removeFromCart(productId: string): Promise<ApiResponse<BackendCartResponse>> {
    const response = await apiClient.delete<ApiResponse<BackendCartResponse>>(`/api/cart/${productId}`);
    return response.data;
  },

  // Clear entire cart
  async clearCart(): Promise<ApiResponse<{ items: [] }>> {
    const response = await apiClient.delete<ApiResponse<{ items: [] }>>('/api/cart');
    return response.data;
  },

  // Sync / bulk replace cart (used on login)
  async syncCart(items: Array<{ productId: string; quantity: number }>): Promise<ApiResponse<BackendCartResponse>> {
    const response = await apiClient.put<ApiResponse<BackendCartResponse>>('/api/cart/sync', {
      items,
    });
    return response.data;
  },
};

export default cartApi;

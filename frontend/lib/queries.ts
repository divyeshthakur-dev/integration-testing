import api from '@/lib/api';
import { ApiResponse, Order, Product, ProductsResponse } from '@/lib/types';

/**
 * Centralized, type-safe Query Key Factory.
 * Prevents key collision and enables targeted cache invalidation.
 */
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (params: { page?: number; limit?: number; search?: string; category?: string; sort?: string }) =>
      ['products', 'list', params] as const,
    categories: ['products', 'categories'] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
  orders: {
    all: ['orders'] as const,
    myOrders: ['orders', 'my-orders'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  cart: {
    all: ['cart'] as const,
  },
};

/**
 * Pure fetcher functions used with TanStack Query.
 */
export async function fetchProducts(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
}): Promise<ProductsResponse> {
  const queryParams: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 12,
  };
  if (params.search) queryParams.search = params.search;
  if (params.category && params.category !== 'all') queryParams.category = params.category;
  if (params.sort && params.sort !== 'default') queryParams.sort = params.sort;

  const { data } = await api.get<ApiResponse<ProductsResponse>>('/api/products', {
    params: queryParams,
  });
  return data.data;
}

export async function fetchCategories(): Promise<string[]> {
  const { data } = await api.get<ApiResponse<string[]>>('/api/products/categories');
  return data.data;
}

export async function fetchProductById(id: string): Promise<Product> {
  const { data } = await api.get<ApiResponse<Product>>(`/api/products/${id}`);
  return data.data;
}

export async function fetchMyOrders(): Promise<Order[]> {
  const { data } = await api.get<ApiResponse<Order[]>>('/api/orders/my-orders');
  return data.data;
}

export async function fetchOrderById(id: string): Promise<Order> {
  const { data } = await api.get<ApiResponse<Order>>(`/api/orders/${id}`);
  return data.data;
}

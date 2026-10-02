import apiClient from './client';
import { ApiResponse, Product, ProductsResponse } from '../types';

export interface ProductQueryParams {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productsApi = {
  // Fetch paginated, searchable, filterable product list
  async getProducts(params?: ProductQueryParams): Promise<ApiResponse<ProductsResponse>> {
    const response = await apiClient.get<ApiResponse<ProductsResponse>>('/api/products', {
      params,
    });
    return response.data;
  },

  // Fetch single product details with reviews
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const response = await apiClient.get<ApiResponse<Product>>(`/api/products/${id}`);
    return response.data;
  },

  // Fetch unique categories
  async getCategories(): Promise<ApiResponse<string[]>> {
    const response = await apiClient.get<ApiResponse<string[]>>('/api/products/categories');
    return response.data;
  },

  // Fetch featured products
  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/api/products/featured');
    return response.data;
  },
};

export default productsApi;

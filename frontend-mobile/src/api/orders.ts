import apiClient from './client';
import { ApiResponse, Order, OrderItem, ShippingAddress } from '../types';

export interface CreateOrderPayload {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
}

export interface StripeCheckoutResponse {
  url: string;
  sessionId: string;
}

export const ordersApi = {
  // 1. Create order document in MongoDB Atlas
  async createOrder(payload: CreateOrderPayload): Promise<ApiResponse<Order>> {
    const response = await apiClient.post<ApiResponse<Order>>('/api/orders', payload);
    return response.data;
  },

  // 2. Create Stripe hosted checkout session
  async createStripeCheckoutSession(orderId: string): Promise<ApiResponse<StripeCheckoutResponse>> {
    const response = await apiClient.post<ApiResponse<StripeCheckoutResponse>>(
      '/api/stripe/create-checkout-session',
      { orderId }
    );
    return response.data;
  },

  // 3. Mock payment processing (instant test fallback)
  async payOrderMock(orderId: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.put<ApiResponse<Order>>(`/api/orders/${orderId}/pay`);
    return response.data;
  },

  // 4. Fetch order details by ID
  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.get<ApiResponse<Order>>(`/api/orders/${orderId}`);
    return response.data;
  },

  // 5. Fetch all orders for current user
  async getMyOrders(): Promise<ApiResponse<Order[]>> {
    const response = await apiClient.get<ApiResponse<Order[]>>('/api/orders/my-orders');
    return response.data;
  },
};

export default ordersApi;

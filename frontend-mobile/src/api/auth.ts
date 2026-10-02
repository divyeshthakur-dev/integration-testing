import apiClient from './client';
import { ApiResponse, User, TotpSetupData, VerifyTotpResponseData } from '../types';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface VerifyTotpPayload {
  name: string;
  email: string;
  password: string;
  secret: string;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  totpCode?: string;
}

export const authApi = {
  // Step 1: Initiate signup, returns temporary secret & QR code data URL (User is NOT yet created in DB)
  async signup(payload: SignupPayload): Promise<ApiResponse<TotpSetupData>> {
    const response = await apiClient.post<ApiResponse<TotpSetupData>>('/api/auth/signup', payload);
    return response.data;
  },

  // Step 2: Verify TOTP token, commits user to MongoDB, returns JWT token & recovery codes
  async verifyTotp(payload: VerifyTotpPayload): Promise<ApiResponse<VerifyTotpResponseData>> {
    const response = await apiClient.post<ApiResponse<VerifyTotpResponseData>>('/api/auth/verify-totp', payload);
    return response.data;
  },

  // Login with email and password (and optional TOTP code)
  async login(payload: LoginPayload): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/api/auth/login', payload);
    return response.data;
  },

  // Fetch current user profile via JWT
  async getMe(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/api/auth/me');
    return response.data;
  },
};

export default authApi;

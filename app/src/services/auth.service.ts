import { apiClient } from '@/lib/api-client';
import { User, AuthResponse } from '@/types';

export const authService = {
  login: async (credentials: any): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  register: async (data: any): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  getProfile: async (): Promise<User> => {
    // Postman says /auth/profile returns user. 
    // It might return { data: User } or just User.
    // Let's assume consistent unwrapping in api-client if no meta.
    return apiClient.get<User>('/auth/profile');
  },

  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },

  forgotPassword: async (email: string): Promise<void> => {
    return apiClient.post<void>('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    return apiClient.post<void>('/auth/reset-password', { token, newPassword });
  }
};

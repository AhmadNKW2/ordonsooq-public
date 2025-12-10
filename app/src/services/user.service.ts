import { apiClient } from '@/lib/api-client';

export type User = {
  id: string;
  name: string;
  email: string;
};

export type CreateUserDto = {
  name: string;
  email: string;
};

export const userService = {
  getAll: () => apiClient.get<User[]>('/users'),

  getById: (id: string) => apiClient.get<User>(`/users/${id}`),

  create: (data: CreateUserDto) => apiClient.post<User>('/users', data),

  update: (id: string, data: Partial<CreateUserDto>) =>
    apiClient.patch<User>(`/users/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/users/${id}`),
};

import { apiClient } from '@/lib/api-client';

export type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePostDto = {
  title: string;
  content: string;
  authorId: string;
};

export type UpdatePostDto = Partial<Omit<CreatePostDto, 'authorId'>>;

export const postService = {
  getAll: () => apiClient.get<Post[]>('/posts'),

  getById: (id: string) => apiClient.get<Post>(`/posts/${id}`),

  getByAuthor: (authorId: string) =>
    apiClient.get<Post[]>(`/posts?authorId=${authorId}`),

  create: (data: CreatePostDto) => apiClient.post<Post>('/posts', data),

  update: (id: string, data: UpdatePostDto) =>
    apiClient.patch<Post>(`/posts/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/posts/${id}`),
};

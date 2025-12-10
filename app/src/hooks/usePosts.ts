import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  postService,
  type CreatePostDto,
  type UpdatePostDto,
} from '@/services/post.service';

export const POST_QUERY_KEYS = {
  all: ['posts'] as const,
  lists: () => [...POST_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...POST_QUERY_KEYS.lists(), filters] as const,
  details: () => [...POST_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...POST_QUERY_KEYS.details(), id] as const,
  byAuthor: (authorId: string) =>
    [...POST_QUERY_KEYS.lists(), { authorId }] as const,
};

export function usePosts() {
  return useQuery({
    queryKey: POST_QUERY_KEYS.lists(),
    queryFn: postService.getAll,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: POST_QUERY_KEYS.detail(id),
    queryFn: () => postService.getById(id),
    enabled: !!id,
  });
}

export function usePostsByAuthor(authorId: string) {
  return useQuery({
    queryKey: POST_QUERY_KEYS.byAuthor(authorId),
    queryFn: () => postService.getByAuthor(authorId),
    enabled: !!authorId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostDto) => postService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.lists() });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostDto }) =>
      postService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.detail(id) });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POST_QUERY_KEYS.lists() });
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { homeService } from '@/services';

export const homeKeys = {
  all: ['home'] as const,
  data: () => [...homeKeys.all, 'data'] as const,
};

/**
 * Hook to fetch home page data (categories, vendors, banners)
 * Uses a single API call to /api/home
 */
export function useHome() {
  return useQuery({
    queryKey: homeKeys.data(),
    queryFn: () => homeService.getHomeData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 1,
  });
}

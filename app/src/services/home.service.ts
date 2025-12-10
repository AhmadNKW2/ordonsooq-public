import { apiClient } from '@/lib/api-client';
import type { HomeData } from '@/types';

type HomeApiResponse = {
  success: boolean;
  data: HomeData;
  message: string;
  time: string;
};

export const homeService = {
  /**
   * Get home page data including categories, vendors, and banners
   * GET /api/home
   */
  getHomeData: async (): Promise<HomeData> => {
    // apiClient.get already unwraps the 'data' field from the response
    const data = await apiClient.get<HomeData>('/home');
    return data;
  },
};

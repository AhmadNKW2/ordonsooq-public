import { apiClient } from '@/lib/api-client';
import type { SeoSettings } from '@/types/api.types';

export const settingsService = {
  getSeoSettings: async (): Promise<SeoSettings> => {
    return apiClient.get<SeoSettings>('/settings/seo');
  },
};
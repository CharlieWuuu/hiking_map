import { createApiClient } from '@hiking-map/core';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export const apiClient = createApiClient({ baseURL, withCredentials: true });

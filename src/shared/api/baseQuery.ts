import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENV } from '@app/config/env';

export const tmdbBaseQuery = fetchBaseQuery({
  baseUrl: ENV.TMDB_BASE_URL,
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    if (ENV.TMDB_BEARER_TOKEN) {
      headers.set('Authorization', `Bearer ${ENV.TMDB_BEARER_TOKEN}`);
    }
    return headers;
  },
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    
    // Always include api_key if bearer token is not present or as fallback
    if (ENV.TMDB_API_KEY && !params?.api_key) {
      searchParams.append('api_key', ENV.TMDB_API_KEY);
    }
    
    // Include default language if not specified
    if (!params?.language) {
      searchParams.append('language', ENV.DEFAULT_LANGUAGE);
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    return searchParams.toString();
  },
});

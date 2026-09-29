import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { ENV } from '@app/config/env';

/**
 * Resolves the TMDB content language from the current settings slice without
 * importing the store type (avoids a runtime cycle with the API slice).
 */
const resolveContentLanguage = (state: unknown): string | null => {
  const language = (state as { settings?: { language?: string } })?.settings
    ?.language;
  switch (language) {
    case 'pt-BR':
      return 'pt-BR';
    case 'es-PY':
      return 'es-ES';
    default:
      return null;
  }
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: ENV.TMDB_BASE_URL,
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    if (ENV.TMDB_BEARER_TOKEN) {
      headers.set('Authorization', `Bearer ${ENV.TMDB_BEARER_TOKEN}`);
    }
    return headers;
  },
});

export const tmdbBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const adjustedArgs: FetchArgs =
    typeof args === 'string' ? { url: args } : { ...args };

  const existingParams = (adjustedArgs.params as Record<string, unknown>) || {};
  const contentLanguage =
    resolveContentLanguage(api.getState()) || ENV.DEFAULT_LANGUAGE;

  adjustedArgs.params = {
    ...(ENV.TMDB_API_KEY && !existingParams.api_key
      ? { api_key: ENV.TMDB_API_KEY }
      : {}),
    ...(contentLanguage && !existingParams.language
      ? { language: contentLanguage }
      : {}),
    ...existingParams,
  };

  return rawBaseQuery(adjustedArgs, api, extraOptions);
};

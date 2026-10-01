import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { ENV } from '@app/config/env';
import { getTmdbLanguage, isAppLanguage } from '@shared/i18n/locale';

/**
 * Resolves the TMDB content locale from the current settings slice without
 * importing the store type (avoids a runtime cycle with the API slice). The
 * app-language -> TMDB-locale mapping lives in `@shared/i18n/locale` so it has
 * a single source of truth with the i18n hook.
 */
const resolveContentLanguage = (state: unknown): string => {
  const language = (state as { settings?: { language?: unknown } })?.settings
    ?.language;
  return isAppLanguage(language)
    ? getTmdbLanguage(language)
    : ENV.TMDB_DEFAULT_LANGUAGE;
};

/** Aborts a stalled TMDB request so the UI never hangs in a loading state. */
const REQUEST_TIMEOUT_MS = 15000;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: ENV.TMDB_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  prepareHeaders: headers => {
    headers.set('Accept', 'application/json');
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
  const contentLanguage = resolveContentLanguage(api.getState());

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

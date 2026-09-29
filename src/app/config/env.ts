/**
 * Application environment configuration
 *
 * Provide your TMDB API key / access token here or via a `.env` file.
 * Both TMDB v3 API Key and v4 Read Access Token are supported.
 */

declare const process: {
  env: Record<string, string | undefined>;
};

const getEnvVar = (key: string, fallback: string = ''): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return fallback;
};

/**
 * Public, demo-only TMDB v3 API key.
 *
 * TMDB v3 API keys are *read-only identifiers*, not account secrets: they can
 * be rotated at any time and cannot be used to mutate or delete data. This
 * value is committed intentionally so the project runs out-of-the-box. In any
 * real deployment (or when shipping your own build) always provide your own key
 * through the `.env` file — see README "Segurança".
 */
const TMDB_DEMO_API_KEY = '2dca580c2a14b55200e784d157207b4d';

export const ENV = {
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  // You can set TMDB_API_KEY (v3) or TMDB_BEARER_TOKEN / TMDB_API_READ_ACCESS_TOKEN (v4)
  TMDB_API_KEY: getEnvVar('TMDB_API_KEY', TMDB_DEMO_API_KEY),
  TMDB_BEARER_TOKEN: getEnvVar(
    'TMDB_BEARER_TOKEN',
    getEnvVar('TMDB_API_READ_ACCESS_TOKEN', ''),
  ),
  DEFAULT_LANGUAGE: 'es-ES', // Default content locale when the user hasn't chosen one
} as const;

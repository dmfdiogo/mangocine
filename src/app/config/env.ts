/**
 * Application configuration.
 *
 * MangoCine ships with a public, read-only TMDB v3 API key so it runs with zero
 * setup. TMDB v3 keys are read-only identifiers: they can be rotated and cannot
 * mutate or delete data. To use your own credentials, replace the value below.
 */
const TMDB_DEMO_API_KEY = '2dca580c2a14b55200e784d157207b4d';

export const ENV = {
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  TMDB_API_KEY: TMDB_DEMO_API_KEY,
  // TMDB content locale used when the app language can't be resolved.
  TMDB_DEFAULT_LANGUAGE: 'es-ES',
} as const;

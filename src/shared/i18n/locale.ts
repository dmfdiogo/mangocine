/**
 * Single source of truth for supported app languages and how they map to the
 * TMDB content locale. Kept dependency-free so both the Redux settings slice
 * and the RTK Query base query can share it without creating import cycles.
 */
export type AppLanguage = 'es-PY' | 'pt-BR';

export const APP_LANGUAGES: readonly AppLanguage[] = ['es-PY', 'pt-BR'];

export const DEFAULT_APP_LANGUAGE: AppLanguage = 'es-PY';

/**
 * TMDB does not expose a Paraguay-specific content locale, so Spanish content
 * is fetched from the generic `es-ES` catalog while the UI copy stays
 * Paraguayan. Portuguese maps directly to `pt-BR`.
 */
export const TMDB_LOCALE_BY_LANGUAGE: Record<AppLanguage, string> = {
  'es-PY': 'es-ES',
  'pt-BR': 'pt-BR',
};

export const getTmdbLanguage = (language: AppLanguage): string =>
  TMDB_LOCALE_BY_LANGUAGE[language];

/**
 * ISO 3166-1 region used for endpoints that filter by release region
 * (`now_playing`, `search`), so results match the user's market instead of
 * defaulting to the US.
 */
export const TMDB_REGION_BY_LANGUAGE: Record<AppLanguage, string> = {
  'es-PY': 'PY',
  'pt-BR': 'BR',
};

export const getTmdbRegion = (language: AppLanguage): string =>
  TMDB_REGION_BY_LANGUAGE[language];

export const isAppLanguage = (value: unknown): value is AppLanguage =>
  value === 'es-PY' || value === 'pt-BR';

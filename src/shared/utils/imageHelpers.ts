import { ENV } from '@app/config/env';

export type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';

const isAbsoluteUrl = (path: string): boolean => /^https?:\/\//i.test(path);

export const getPosterUrl = (
  path: string | null | undefined,
  size: PosterSize = 'w342'
): string | null => {
  if (!path) return null;
  if (isAbsoluteUrl(path)) return path;
  return `${ENV.TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (
  path: string | null | undefined,
  size: BackdropSize = 'w780'
): string | null => {
  if (!path) return null;
  if (isAbsoluteUrl(path)) return path;
  return `${ENV.TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

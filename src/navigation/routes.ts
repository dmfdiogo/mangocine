export const ROUTES = {
  MOVIE_LIST: 'MovieList',
  MOVIE_DETAIL: 'MovieDetail',
} as const;

export type RouteNames = (typeof ROUTES)[keyof typeof ROUTES];

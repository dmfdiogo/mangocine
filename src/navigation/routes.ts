export const ROUTES = {
  WELCOME: 'Welcome',
  MOVIE_LIST: 'MovieList',
  MOVIE_DETAIL: 'MovieDetail',
  FAVORITES: 'Favorites',
} as const;

export type RouteNames = (typeof ROUTES)[keyof typeof ROUTES];

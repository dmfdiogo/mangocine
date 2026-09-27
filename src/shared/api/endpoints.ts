export const API_ENDPOINTS = {
  // Movies
  POPULAR_MOVIES: '/movie/popular',
  TOP_RATED_MOVIES: '/movie/top_rated',
  NOW_PLAYING_MOVIES: '/movie/now_playing',
  MOVIE_DETAILS: (id: number) => `/movie/${id}`,
  MOVIE_CREDITS: (id: number) => `/movie/${id}/credits`,

  // Search
  SEARCH_MOVIES: '/search/movie',

  // Genres
  GENRES_LIST: '/genre/movie/list',
} as const;

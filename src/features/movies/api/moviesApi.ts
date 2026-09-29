import { createApi } from '@reduxjs/toolkit/query/react';
import { tmdbBaseQuery } from '@shared/api/baseQuery';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import {
  MovieDTO,
  MovieDetailsDTO,
  MovieCreditsDTO,
  MovieCategory,
  PaginatedResponse,
} from './types';

type PaginatedArgs = { page: number };

const getCategoryEndpoint = (category: MovieCategory): string => {
  switch (category) {
    case 'top_rated':
      return API_ENDPOINTS.TOP_RATED_MOVIES;
    case 'now_playing':
      return API_ENDPOINTS.NOW_PLAYING_MOVIES;
    case 'upcoming':
      return API_ENDPOINTS.UPCOMING_MOVIES;
    case 'popular':
    default:
      return API_ENDPOINTS.POPULAR_MOVIES;
  }
};

/**
 * Appends a page onto the cached list, dropping duplicate ids so overlapping
 * pages (TMDB does this on popular/upcoming) never render twice. Page 1
 * replaces the cache outright, which is what a refresh/category switch needs.
 *
 * Shared by every paginated list endpoint so the behavior can't drift.
 */
const mergePageResults = (
  currentCache: PaginatedResponse<MovieDTO>,
  newItems: PaginatedResponse<MovieDTO>,
  { arg }: { arg: PaginatedArgs },
): PaginatedResponse<MovieDTO> | void => {
  if (arg.page === 1) {
    return newItems;
  }
  // Defensive: a 200 with an unexpected shape (API change/partial outage) must
  // not crash the reducer while appending. Keep the cache we already have.
  if (!newItems || !Array.isArray(newItems.results)) {
    return currentCache;
  }
  const existingIds = new Set(currentCache.results.map(movie => movie.id));
  const uniqueNew = newItems.results.filter(
    movie => !existingIds.has(movie.id),
  );
  currentCache.results.push(...uniqueNew);
  currentCache.page = newItems.page;
  currentCache.total_pages = newItems.total_pages;
};

/**
 * Builds a `serializeQueryArgs` that keeps one cache entry per *logical* list
 * (category or normalized search term), independent of the requested page.
 */
const serializeByListKey =
  <Arg extends PaginatedArgs>(keyOf: (arg: Arg) => string) =>
  ({ endpointName, queryArgs }: { endpointName: string; queryArgs: Arg }) =>
    `${endpointName}-${keyOf(queryArgs)}`;

/** Refetch only when the page or the logical list key changes. */
const forceRefetchOnPageOrKey =
  <Arg extends PaginatedArgs>(keyOf: (arg: Arg) => string) =>
  ({ currentArg, previousArg }: { currentArg?: Arg; previousArg?: Arg }) => {
    if (!currentArg || !previousArg) {
      return true;
    }
    return (
      currentArg.page !== previousArg.page ||
      keyOf(currentArg) !== keyOf(previousArg)
    );
  };

const normalizeQuery = (query: string): string => query.trim().toLowerCase();

export const moviesApi = createApi({
  reducerPath: 'moviesApi',
  baseQuery: tmdbBaseQuery,
  tagTypes: ['Movies', 'MovieDetails', 'MovieCredits'],
  endpoints: builder => ({
    // Category-based movie list with infinite pagination
    getMoviesByCategory: builder.query<
      PaginatedResponse<MovieDTO>,
      { category: MovieCategory; page: number }
    >({
      query: ({ category, page = 1 }) => ({
        url: getCategoryEndpoint(category),
        params: { page },
      }),
      serializeQueryArgs: serializeByListKey<{
        category: MovieCategory;
        page: number;
      }>(({ category }) => category),
      merge: mergePageResults,
      forceRefetch: forceRefetchOnPageOrKey<{
        category: MovieCategory;
        page: number;
      }>(({ category }) => category),
      providesTags: ['Movies'],
    }),

    // Search movies with infinite pagination
    searchMovies: builder.query<
      PaginatedResponse<MovieDTO>,
      { query: string; page: number }
    >({
      query: ({ query, page = 1 }) => ({
        url: API_ENDPOINTS.SEARCH_MOVIES,
        params: { query, page },
      }),
      serializeQueryArgs: serializeByListKey<{
        query: string;
        page: number;
      }>(({ query }) => normalizeQuery(query)),
      merge: mergePageResults,
      forceRefetch: forceRefetchOnPageOrKey<{
        query: string;
        page: number;
      }>(({ query }) => normalizeQuery(query)),
    }),

    // Movie details by ID
    getMovieDetails: builder.query<MovieDetailsDTO, number>({
      query: movieId => ({
        url: API_ENDPOINTS.MOVIE_DETAILS(movieId),
      }),
      providesTags: (_result, _error, id) => [{ type: 'MovieDetails', id }],
    }),

    // Movie cast & credits
    getMovieCredits: builder.query<MovieCreditsDTO, number>({
      query: movieId => ({
        url: API_ENDPOINTS.MOVIE_CREDITS(movieId),
      }),
      providesTags: (_result, _error, id) => [{ type: 'MovieCredits', id }],
    }),
  }),
});

export const {
  useGetMoviesByCategoryQuery,
  useSearchMoviesQuery,
  useGetMovieDetailsQuery,
  useGetMovieCreditsQuery,
} = moviesApi;

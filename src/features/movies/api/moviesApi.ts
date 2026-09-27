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

export const moviesApi = createApi({
  reducerPath: 'moviesApi',
  baseQuery: tmdbBaseQuery,
  tagTypes: ['Movies', 'MovieDetails', 'MovieCredits'],
  endpoints: (builder) => ({
    // Category-based movie list with infinite pagination
    getMoviesByCategory: builder.query<
      PaginatedResponse<MovieDTO>,
      { category: MovieCategory; page: number }
    >({
      query: ({ category, page = 1 }) => ({
        url: getCategoryEndpoint(category),
        params: { page },
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.category}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        const existingIds = new Set(currentCache.results.map((m) => m.id));
        const uniqueNew = newItems.results.filter((m) => !existingIds.has(m.id));
        currentCache.results.push(...uniqueNew);
        currentCache.page = newItems.page;
        currentCache.total_pages = newItems.total_pages;
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.category !== previousArg?.category
        );
      },
      providesTags: ['Movies'],
    }),

    // Backwards-compatible popular movies endpoint
    getPopularMovies: builder.query<PaginatedResponse<MovieDTO>, number>({
      query: (page = 1) => ({
        url: API_ENDPOINTS.POPULAR_MOVIES,
        params: { page },
      }),
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg: page }) => {
        if (page === 1) {
          return newItems;
        }
        const existingIds = new Set(currentCache.results.map((m) => m.id));
        const uniqueNew = newItems.results.filter((m) => !existingIds.has(m.id));
        currentCache.results.push(...uniqueNew);
        currentCache.page = newItems.page;
        currentCache.total_pages = newItems.total_pages;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: ['Movies'],
    }),

    // Search movies with infinite pagination
    searchMovies: builder.query<PaginatedResponse<MovieDTO>, { query: string; page: number }>({
      query: ({ query, page = 1 }) => ({
        url: API_ENDPOINTS.SEARCH_MOVIES,
        params: { query, page },
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.query.trim().toLowerCase()}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        const existingIds = new Set(currentCache.results.map((m) => m.id));
        const uniqueNew = newItems.results.filter((m) => !existingIds.has(m.id));
        currentCache.results.push(...uniqueNew);
        currentCache.page = newItems.page;
        currentCache.total_pages = newItems.total_pages;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page || currentArg?.query !== previousArg?.query;
      },
    }),

    // Movie details by ID
    getMovieDetails: builder.query<MovieDetailsDTO, number>({
      query: (movieId) => ({
        url: API_ENDPOINTS.MOVIE_DETAILS(movieId),
      }),
      providesTags: (_result, _error, id) => [{ type: 'MovieDetails', id }],
    }),

    // Movie cast & credits
    getMovieCredits: builder.query<MovieCreditsDTO, number>({
      query: (movieId) => ({
        url: API_ENDPOINTS.MOVIE_CREDITS(movieId),
      }),
      providesTags: (_result, _error, id) => [{ type: 'MovieCredits', id }],
    }),
  }),
});

export const {
  useGetMoviesByCategoryQuery,
  useGetPopularMoviesQuery,
  useSearchMoviesQuery,
  useGetMovieDetailsQuery,
  useGetMovieCreditsQuery,
} = moviesApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { tmdbBaseQuery } from '@shared/api/baseQuery';
import { API_ENDPOINTS } from '@shared/api/endpoints';
import { MovieDTO, MovieDetailsDTO, PaginatedResponse } from './types';

export const moviesApi = createApi({
  reducerPath: 'moviesApi',
  baseQuery: tmdbBaseQuery,
  tagTypes: ['Movies', 'MovieDetails'],
  endpoints: (builder) => ({
    // Infinite paginated popular movies
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
  }),
});

export const {
  useGetPopularMoviesQuery,
  useSearchMoviesQuery,
  useGetMovieDetailsQuery,
} = moviesApi;

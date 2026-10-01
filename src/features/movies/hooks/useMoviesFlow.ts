import { useState, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { selectLanguage } from '@app/store/settingsSlice';
import { getTmdbRegion } from '@shared/i18n/locale';
import {
  setSelectedCategory,
  setSearchQuery,
  incrementCategoryPage,
  incrementSearchPage,
  resetCategoryPage,
  resetSearchPage,
  setPaginationError,
  selectSelectedCategory,
  selectSearchQuery,
  selectCategoryPage,
  selectSearchPage,
  selectPaginationError,
} from '../store/moviesSlice';
import {
  useGetMoviesByCategoryQuery,
  useSearchMoviesQuery,
  moviesApi,
} from '../api/moviesApi';
import { MovieDTO, MovieCategory } from '../api/types';
import { useDebounce } from '@features/search/hooks/useDebounce';

/**
 * Number of pages fetched on first load to guarantee a long, stutter-free
 * scroll before the next network request. Pages are fetched sequentially by
 * this hook (see effects below) so the append-merge keeps result order.
 */
const INITIAL_CATEGORY_PAGES = 5;
const INITIAL_SEARCH_PAGES = 2;

/**
 * Hard caps on how many pages we accumulate per session. Keeps memory bounded
 * for the "bank statement" volume scenario (100 items/page).
 */
const MAX_CATEGORY_PAGES = 25;
const MAX_SEARCH_PAGES = 10;

export function useMoviesFlow() {
  const dispatch = useAppDispatch();

  // Redux state
  const selectedCategory = useAppSelector(selectSelectedCategory);
  const searchQuery = useAppSelector(selectSearchQuery);
  const categoryPage = useAppSelector(selectCategoryPage);
  const searchPage = useAppSelector(selectSearchPage);
  const paginationError = useAppSelector(selectPaginationError);
  const language = useAppSelector(selectLanguage);

  // Region keeps `now_playing`/search results in the user's market.
  const region = getTmdbRegion(language);

  // Local state for pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounced search query
  const debouncedQuery = useDebounce(searchQuery.trim(), 400);

  // Require the *raw* query to still be valid too, so clearing the input exits
  // search mode immediately instead of showing stale results for 400ms.
  const isSearchMode =
    debouncedQuery.length >= 2 && searchQuery.trim().length >= 2;
  const isDebouncing =
    searchQuery.trim().length >= 2 && searchQuery.trim() !== debouncedQuery;
  const isSearchTooShort = searchQuery.trim().length === 1;

  // Category movies query
  const categoryQueryResult = useGetMoviesByCategoryQuery(
    { category: selectedCategory, page: categoryPage, region },
    { skip: isSearchMode },
  );

  // Search movies query
  const searchQueryResult = useSearchMoviesQuery(
    { query: debouncedQuery, page: searchPage, region },
    { skip: !isSearchMode },
  );

  const activeQuery = isSearchMode ? searchQueryResult : categoryQueryResult;
  const { data, isLoading, isFetching, isError, refetch } = activeQuery;

  // Check if error is on pagination (page > 1) vs initial load
  const currentPage = isSearchMode ? searchPage : categoryPage;
  const isPaginationErrorFromApi = Boolean(
    isError && data && data.results.length > 0 && currentPage > 1,
  );

  // Mirror the API-derived pagination error into the slice so it can be
  // cleared explicitly on retry and reset when the request succeeds.
  useEffect(() => {
    if (isPaginationErrorFromApi && paginationError === null) {
      dispatch(setPaginationError('pagination_failed'));
    } else if (!isPaginationErrorFromApi && paginationError !== null) {
      dispatch(setPaginationError(null));
    }
  }, [isPaginationErrorFromApi, paginationError, dispatch]);

  // Warm the cache with the first N pages, one page at a time. Because each
  // increment only happens after the previous page succeeded, the append-merge
  // preserves page order (parallel requests could arrive out of order).
  // Advance only when the *requested* page has actually loaded. Comparing with
  // `result.page` (instead of trusting `isFetching` from this closure) prevents
  // skipping pages while the previous request is still in flight — RTK Query
  // starts the next request in its own effect, so `isFetching` can be stale here.
  useEffect(() => {
    if (isSearchMode) return;
    const result = categoryQueryResult.data;
    if (!result || result.page >= result.total_pages) return;
    if (result.page === categoryPage && categoryPage < INITIAL_CATEGORY_PAGES) {
      dispatch(incrementCategoryPage());
    }
  }, [isSearchMode, categoryQueryResult.data, categoryPage, dispatch]);

  useEffect(() => {
    if (!isSearchMode) return;
    const result = searchQueryResult.data;
    if (!result || result.page >= result.total_pages) return;
    if (result.page === searchPage && searchPage < INITIAL_SEARCH_PAGES) {
      dispatch(incrementSearchPage());
    }
  }, [isSearchMode, searchQueryResult.data, searchPage, dispatch]);

  // Handlers
  const handleCategoryChange = useCallback(
    (category: MovieCategory) => {
      dispatch(setSelectedCategory(category));
    },
    [dispatch],
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      dispatch(setSearchQuery(text));
    },
    [dispatch],
  );

  const handleClearSearch = useCallback(() => {
    dispatch(setSearchQuery(''));
    dispatch(resetSearchPage());
  }, [dispatch]);

  const maxPages = isSearchMode ? MAX_SEARCH_PAGES : MAX_CATEGORY_PAGES;
  const requestedPage = isSearchMode ? searchPage : categoryPage;

  // Infinite Scroll Trigger
  const handleEndReached = useCallback(() => {
    // Avoid runaway pagination while a request is in flight, after a fatal
    // error, or while a pagination error is pending explicit retry.
    if (isFetching || isLoading || isError || paginationError) return;
    if (isPaginationErrorFromApi) return;
    if (requestedPage >= maxPages) return;

    if (data && data.page < data.total_pages) {
      if (isSearchMode) {
        dispatch(incrementSearchPage());
      } else {
        dispatch(incrementCategoryPage());
      }
    }
  }, [
    data,
    isFetching,
    isLoading,
    isSearchMode,
    isError,
    isPaginationErrorFromApi,
    paginationError,
    requestedPage,
    maxPages,
    dispatch,
  ]);

  // Retry pagination failure
  const handleRetryPagination = useCallback(() => {
    dispatch(setPaginationError(null));
    refetch();
  }, [dispatch, refetch]);

  // Pull-to-refresh: explicitly reload page 1 (replacing the cache) instead of
  // refetching the stale current arg, which could append page N out of order.
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    dispatch(setPaginationError(null));
    try {
      if (isSearchMode) {
        dispatch(resetSearchPage());
        await dispatch(
          moviesApi.endpoints.searchMovies.initiate(
            { query: debouncedQuery, page: 1, region },
            { forceRefetch: true, subscribe: false },
          ),
        );
      } else {
        dispatch(resetCategoryPage());
        await dispatch(
          moviesApi.endpoints.getMoviesByCategory.initiate(
            { category: selectedCategory, page: 1, region },
            { forceRefetch: true, subscribe: false },
          ),
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isSearchMode, debouncedQuery, selectedCategory, region, dispatch]);

  // Optimistic Prefetching on touch down
  const handleMoviePrefetch = useCallback(
    (movie: MovieDTO) => {
      dispatch(
        moviesApi.util.prefetch('getMovieDetails', movie.id, { force: false }),
      );
      dispatch(
        moviesApi.util.prefetch('getMovieCredits', movie.id, { force: false }),
      );
    },
    [dispatch],
  );

  const movies = data?.results || [];
  const isLimitReached = Boolean(
    data && data.page >= maxPages && data.page < data.total_pages,
  );

  return {
    // Data
    movies,
    totalResults: data?.total_results || 0,
    hasMorePages: data ? data.page < data.total_pages : false,
    isLimitReached,

    // States
    selectedCategory,
    searchQuery,
    debouncedQuery,
    isSearchMode,
    isDebouncing,
    isSearchTooShort,
    isLoading: isLoading && movies.length === 0,
    isFetching,
    isError: isError && movies.length === 0,
    isPaginationError: isPaginationErrorFromApi || Boolean(paginationError),
    isRefreshing,

    // Actions
    onCategoryChange: handleCategoryChange,
    onSearchChange: handleSearchChange,
    onClearSearch: handleClearSearch,
    onEndReached: handleEndReached,
    onRefresh: handleRefresh,
    onRetry: refetch,
    onRetryPagination: handleRetryPagination,
    onMoviePrefetch: handleMoviePrefetch,
  };
}

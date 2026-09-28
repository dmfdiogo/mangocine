import { useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
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
import { CATEGORIES } from '../components/CategoryFilterTabs';
import { useDebounce } from '@features/search/hooks/useDebounce';

export function useMoviesFlow() {
  const dispatch = useAppDispatch();

  // Redux state
  const selectedCategory = useAppSelector(selectSelectedCategory);
  const searchQuery = useAppSelector(selectSearchQuery);
  const categoryPage = useAppSelector(selectCategoryPage);
  const searchPage = useAppSelector(selectSearchPage);
  const paginationError = useAppSelector(selectPaginationError);

  // Local state for pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounced search query
  const debouncedQuery = useDebounce(searchQuery.trim(), 400);

  const isSearchMode = debouncedQuery.length >= 2;
  const isDebouncing =
    searchQuery.trim().length >= 2 &&
    searchQuery.trim() !== debouncedQuery;

  // Category movies query
  const categoryQueryResult = useGetMoviesByCategoryQuery(
    { category: selectedCategory, page: categoryPage },
    { skip: isSearchMode }
  );

  // Search movies query
  const searchQueryResult = useSearchMoviesQuery(
    { query: debouncedQuery, page: searchPage },
    { skip: !isSearchMode }
  );

  const activeQuery = isSearchMode ? searchQueryResult : categoryQueryResult;
  const { data, isLoading, isFetching, isError, refetch } = activeQuery;

  // Check if error is on pagination (page > 1) vs initial load
  const currentPage = isSearchMode ? searchPage : categoryPage;
  const isPaginationError = Boolean(
    isError && data && data.results.length > 0 && currentPage > 1
  );

  // Handlers
  const handleCategoryChange = useCallback(
    (category: MovieCategory) => {
      dispatch(setSelectedCategory(category));
    },
    [dispatch]
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      dispatch(setSearchQuery(text));
    },
    [dispatch]
  );

  const handleClearSearch = useCallback(() => {
    dispatch(setSearchQuery(''));
  }, [dispatch]);

  // Infinite Scroll Trigger
  const handleEndReached = useCallback(() => {
    if (isFetching || isLoading) return;

    if (data && data.page < data.total_pages) {
      if (isSearchMode) {
        dispatch(incrementSearchPage());
      } else {
        dispatch(incrementCategoryPage());
      }
    }
  }, [data, isFetching, isLoading, isSearchMode, dispatch]);

  // Retry pagination failure
  const handleRetryPagination = useCallback(() => {
    dispatch(setPaginationError(null));
    refetch();
  }, [dispatch, refetch]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    dispatch(setPaginationError(null));
    if (isSearchMode) {
      dispatch(resetSearchPage());
    } else {
      dispatch(resetCategoryPage());
    }
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [isSearchMode, dispatch, refetch]);

  // Optimistic Prefetching on touch down
  const handleMoviePrefetch = useCallback(
    (movie: MovieDTO) => {
      dispatch(
        moviesApi.util.prefetch('getMovieDetails', movie.id, { force: false })
      );
      dispatch(
        moviesApi.util.prefetch('getMovieCredits', movie.id, { force: false })
      );
    },
    [dispatch]
  );

  // Category label
  const currentCategoryLabel = useMemo(() => {
    const found = CATEGORIES.find((c) => c.id === selectedCategory);
    return found ? `${found.icon} ${found.label}` : 'Películas';
  }, [selectedCategory]);

  const movies = data?.results || [];

  return {
    // Data
    movies,
    totalResults: data?.total_results || 0,
    hasMorePages: data ? data.page < data.total_pages : false,

    // States
    selectedCategory,
    searchQuery,
    debouncedQuery,
    isSearchMode,
    isDebouncing,
    isLoading: isLoading && movies.length === 0,
    isFetching,
    isError: isError && movies.length === 0,
    isPaginationError: isPaginationError || Boolean(paginationError),
    isRefreshing,
    currentCategoryLabel,

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

import {
  moviesSlice,
  setSelectedCategory,
  setSearchQuery,
  incrementCategoryPage,
  incrementSearchPage,
  resetCategoryPage,
  resetSearchPage,
  setPaginationError,
  resetAllFilters,
  selectTrimmedSearchQuery,
  selectIsSearchActive,
  selectCurrentActivePage,
  MoviesState,
} from '@features/movies/store/moviesSlice';
import type { RootState } from '@app/store';

describe('moviesSlice', () => {
  const initialState: MoviesState = {
    selectedCategory: 'popular',
    searchQuery: '',
    categoryPage: 1,
    searchPage: 1,
    paginationError: null,
  };

  it('handles setSelectedCategory and resets page', () => {
    const state = { ...initialState, categoryPage: 3 };
    const nextState = moviesSlice.reducer(state, setSelectedCategory('top_rated'));

    expect(nextState.selectedCategory).toBe('top_rated');
    expect(nextState.categoryPage).toBe(1);
    expect(nextState.paginationError).toBeNull();
  });

  it('handles setSearchQuery and resets searchPage when valid query', () => {
    const state = { ...initialState, searchPage: 4 };
    const nextState = moviesSlice.reducer(state, setSearchQuery('Spider'));

    expect(nextState.searchQuery).toBe('Spider');
    expect(nextState.searchPage).toBe(1);
  });

  it('increments pages correctly', () => {
    let state = moviesSlice.reducer(initialState, incrementCategoryPage());
    expect(state.categoryPage).toBe(2);

    state = moviesSlice.reducer(state, incrementSearchPage());
    expect(state.searchPage).toBe(2);
  });

  it('resets pages correctly', () => {
    let state = { ...initialState, categoryPage: 5, searchPage: 5 };
    state = moviesSlice.reducer(state, resetCategoryPage());
    expect(state.categoryPage).toBe(1);

    state = moviesSlice.reducer(state, resetSearchPage());
    expect(state.searchPage).toBe(1);
  });

  it('handles setPaginationError', () => {
    const state = moviesSlice.reducer(
      initialState,
      setPaginationError('Network timeout on page 2')
    );
    expect(state.paginationError).toBe('Network timeout on page 2');
  });

  it('handles resetAllFilters', () => {
    const dirtyState: MoviesState = {
      selectedCategory: 'upcoming',
      searchQuery: 'Avengers',
      categoryPage: 4,
      searchPage: 3,
      paginationError: 'Error',
    };

    const nextState = moviesSlice.reducer(dirtyState, resetAllFilters());
    expect(nextState).toEqual(initialState);
  });

  describe('memoized selectors', () => {
    it('selectTrimmedSearchQuery trims whitespace', () => {
      const state = { movies: { ...initialState, searchQuery: '  Batman  ' } } as RootState;
      expect(selectTrimmedSearchQuery(state)).toBe('Batman');
    });

    it('selectIsSearchActive returns true only when query >= 2 chars', () => {
      const shortState = { movies: { ...initialState, searchQuery: 'a' } } as RootState;
      expect(selectIsSearchActive(shortState)).toBe(false);

      const activeState = { movies: { ...initialState, searchQuery: 'Dune' } } as RootState;
      expect(selectIsSearchActive(activeState)).toBe(true);
    });

    it('selectCurrentActivePage returns searchPage when searching, categoryPage otherwise', () => {
      const categoryState = {
        movies: { ...initialState, categoryPage: 3, searchPage: 1, searchQuery: '' },
      } as RootState;
      expect(selectCurrentActivePage(categoryState)).toBe(3);

      const searchingState = {
        movies: { ...initialState, categoryPage: 3, searchPage: 5, searchQuery: 'Matrix' },
      } as RootState;
      expect(selectCurrentActivePage(searchingState)).toBe(5);
    });
  });
});

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MovieCategory } from '../api/types';
import type { RootState } from '@app/store';

export interface MoviesState {
  selectedCategory: MovieCategory;
  searchQuery: string;
  categoryPage: number;
  searchPage: number;
  paginationError: string | null;
}

const initialState: MoviesState = {
  selectedCategory: 'popular',
  searchQuery: '',
  categoryPage: 1,
  searchPage: 1,
  paginationError: null,
};

export const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<MovieCategory>) => {
      state.selectedCategory = action.payload;
      state.categoryPage = 1;
      state.paginationError = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      if (action.payload.trim().length >= 2) {
        state.searchPage = 1;
      }
      state.paginationError = null;
    },
    incrementCategoryPage: (state) => {
      state.categoryPage += 1;
      state.paginationError = null;
    },
    incrementSearchPage: (state) => {
      state.searchPage += 1;
      state.paginationError = null;
    },
    resetCategoryPage: (state) => {
      state.categoryPage = 1;
      state.paginationError = null;
    },
    resetSearchPage: (state) => {
      state.searchPage = 1;
      state.paginationError = null;
    },
    setPaginationError: (state, action: PayloadAction<string | null>) => {
      state.paginationError = action.payload;
    },
    resetAllFilters: (state) => {
      state.selectedCategory = 'popular';
      state.searchQuery = '';
      state.categoryPage = 1;
      state.searchPage = 1;
      state.paginationError = null;
    },
  },
});

export const {
  setSelectedCategory,
  setSearchQuery,
  incrementCategoryPage,
  incrementSearchPage,
  resetCategoryPage,
  resetSearchPage,
  setPaginationError,
  resetAllFilters,
} = moviesSlice.actions;

// Selectors
export const selectSelectedCategory = (state: RootState) => state.movies.selectedCategory;
export const selectSearchQuery = (state: RootState) => state.movies.searchQuery;
export const selectCategoryPage = (state: RootState) => state.movies.categoryPage;
export const selectSearchPage = (state: RootState) => state.movies.searchPage;
export const selectPaginationError = (state: RootState) => state.movies.paginationError;

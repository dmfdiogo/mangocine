import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { MovieDTO } from '../api/types';
import type { RootState } from '@app/store';

export interface FavoritesState {
  byId: Record<number, MovieDTO>;
  allIds: number[];
}

const initialState: FavoritesState = {
  byId: {},
  allIds: [],
};

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<MovieDTO>) => {
      const movie = action.payload;
      if (state.byId[movie.id]) {
        // Remove from favorites
        delete state.byId[movie.id];
        state.allIds = state.allIds.filter((id) => id !== movie.id);
      } else {
        // Add to favorites
        state.byId[movie.id] = movie;
        state.allIds.unshift(movie.id);
      }
    },
    removeFavorite: (state, action: PayloadAction<number>) => {
      const movieId = action.payload;
      if (state.byId[movieId]) {
        delete state.byId[movieId];
        state.allIds = state.allIds.filter((id) => id !== movieId);
      }
    },
    clearFavorites: (state) => {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const { toggleFavorite, removeFavorite, clearFavorites } =
  favoritesSlice.actions;

// Base selector
export const selectFavoritesState = (state: RootState): FavoritesState =>
  state.favorites;

// Memoized selectors via createSelector (Reselect)
export const selectAllFavorites = createSelector(
  [selectFavoritesState],
  (favorites): MovieDTO[] => favorites.allIds.map((id) => favorites.byId[id])
);

export const selectFavoriteIds = createSelector(
  [selectFavoritesState],
  (favorites): number[] => favorites.allIds
);

export const selectFavoritesCount = createSelector(
  [selectFavoriteIds],
  (allIds): number => allIds.length
);

export const selectIsFavorite = (movieId: number) =>
  createSelector(
    [selectFavoritesState],
    (favorites): boolean => Boolean(favorites.byId[movieId])
  );

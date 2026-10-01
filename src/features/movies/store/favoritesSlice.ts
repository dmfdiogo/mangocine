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
        state.allIds = state.allIds.filter(id => id !== movie.id);
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
        state.allIds = state.allIds.filter(id => id !== movieId);
      }
    },
    clearFavorites: state => {
      state.byId = {};
      state.allIds = [];
    },
    hydrateFavorites: (state, action: PayloadAction<FavoritesState>) => {
      const payload = action.payload;
      if (payload && payload.byId && Array.isArray(payload.allIds)) {
        state.byId = payload.byId;
        // Drop ids without a matching entity so selectors never yield
        // `undefined` items (would crash list rendering).
        state.allIds = payload.allIds.filter(id => Boolean(payload.byId[id]));
      }
    },
  },
});

export const {
  toggleFavorite,
  removeFavorite,
  clearFavorites,
  hydrateFavorites,
} = favoritesSlice.actions;

// Base selector
export const selectFavoritesState = (state: RootState): FavoritesState =>
  state.favorites;

// Memoized selectors via createSelector (Reselect)
export const selectAllFavorites = createSelector(
  [selectFavoritesState],
  (favorites): MovieDTO[] => favorites.allIds.map(id => favorites.byId[id]),
);

export const selectFavoriteIds = createSelector(
  [selectFavoritesState],
  (favorites): number[] => favorites.allIds,
);

export const selectFavoritesCount = createSelector(
  [selectFavoriteIds],
  (allIds): number => allIds.length,
);

/**
 * Plain (non-memoized) lookup by id. It used to be a `createSelector` factory,
 * but calling it inside a render created a new memoized selector on every
 * render — the exact anti-pattern it was meant to avoid. The derived value is a
 * cheap boolean, so a direct read is both simpler and faster.
 */
export const selectIsFavorite = (state: RootState, movieId: number): boolean =>
  Boolean(state.favorites.byId[movieId]);

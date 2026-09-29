import { combineReducers } from '@reduxjs/toolkit';
import { moviesApi } from '@features/movies/api/moviesApi';
import { moviesSlice } from '@features/movies/store/moviesSlice';
import { favoritesSlice } from '@features/movies/store/favoritesSlice';
import { settingsSlice } from './settingsSlice';

export const rootReducer = combineReducers({
  [moviesApi.reducerPath]: moviesApi.reducer,
  [moviesSlice.name]: moviesSlice.reducer,
  [favoritesSlice.name]: favoritesSlice.reducer,
  [settingsSlice.name]: settingsSlice.reducer,
});

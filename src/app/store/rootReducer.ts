import { combineReducers } from '@reduxjs/toolkit';
import { moviesApi } from '@features/movies/api/moviesApi';
import { moviesSlice } from '@features/movies/store/moviesSlice';
import { favoritesSlice } from '@features/movies/store/favoritesSlice';

export const rootReducer = combineReducers({
  [moviesApi.reducerPath]: moviesApi.reducer,
  [moviesSlice.name]: moviesSlice.reducer,
  [favoritesSlice.name]: favoritesSlice.reducer,
});

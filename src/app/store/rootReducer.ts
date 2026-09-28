import { combineReducers } from '@reduxjs/toolkit';
import { moviesApi } from '@features/movies/api/moviesApi';
import { moviesSlice } from '@features/movies/store/moviesSlice';

export const rootReducer = combineReducers({
  [moviesApi.reducerPath]: moviesApi.reducer,
  [moviesSlice.name]: moviesSlice.reducer,
});

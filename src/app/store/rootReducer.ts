import { combineReducers } from '@reduxjs/toolkit';
import { moviesApi } from '@features/movies/api/moviesApi';

export const rootReducer = combineReducers({
  [moviesApi.reducerPath]: moviesApi.reducer,
});

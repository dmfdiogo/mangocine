import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { rootReducer } from './rootReducer';
import { moviesApi } from '@features/movies/api/moviesApi';
import { rtkQueryErrorLogger } from './middleware/errorLogger';
import { setLanguage, toggleLanguage } from './settingsSlice';
import { startPersistence } from './persistence';
import {
  resetCategoryPage,
  resetSearchPage,
} from '@features/movies/store/moviesSlice';

// When the UI language changes, the TMDB `language` param changes too. The
// cache is keyed without language, so invalidating page 5 would append a
// single foreign-language page onto pages 1-4. We reset pagination and drop
// the API cache so the list restarts cleanly in the new language.
const languageListener = createListenerMiddleware();
languageListener.startListening({
  matcher: isAnyOf(setLanguage, toggleLanguage),
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(resetCategoryPage());
    listenerApi.dispatch(resetSearchPage());
    listenerApi.dispatch(moviesApi.util.resetApiState());
  },
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      moviesApi.middleware,
      rtkQueryErrorLogger,
      languageListener.middleware
    ),
});

setupListeners(store.dispatch);

// Persist language + favorites across app restarts.
startPersistence(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

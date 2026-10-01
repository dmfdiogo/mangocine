import type { Store } from '@reduxjs/toolkit';
import { storage, STORAGE_KEYS } from '@shared/storage';
import { isAppLanguage } from '@shared/i18n/locale';
import { hydrateLanguage } from './settingsSlice';
import {
  hydrateFavorites,
  FavoritesState,
} from '@features/movies/store/favoritesSlice';
import type { RootState } from './index';

/** Restores persisted language and favorites into the store. */
export const hydrateStore = async (store: Store<RootState>): Promise<void> => {
  const [language, favorites] = await Promise.all([
    storage.get<string>(STORAGE_KEYS.language),
    storage.get<FavoritesState>(STORAGE_KEYS.favorites),
  ]);

  if (isAppLanguage(language)) {
    store.dispatch(hydrateLanguage(language));
  }
  if (favorites) {
    store.dispatch(hydrateFavorites(favorites));
  }
};

/** Persists language and favorites whenever they change. */
export const startPersistence = (store: Store<RootState>): void => {
  let lastLanguage = store.getState().settings.language;
  let lastFavorites = store.getState().favorites;

  store.subscribe(() => {
    const { settings, favorites } = store.getState();

    if (settings.language !== lastLanguage) {
      lastLanguage = settings.language;
      storage.set(STORAGE_KEYS.language, lastLanguage).catch(() => {});
    }

    if (favorites !== lastFavorites) {
      lastFavorites = favorites;
      storage.set(STORAGE_KEYS.favorites, lastFavorites).catch(() => {});
    }
  });
};

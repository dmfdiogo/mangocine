import { configureStore } from '@reduxjs/toolkit';
import { hydrateStore } from '@app/store/persistence';
import { rootReducer } from '@app/store/rootReducer';
import { storage, STORAGE_KEYS } from '@shared/storage';
import { MovieDTO } from '@features/movies/api/types';

const createTestStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

const favorite: MovieDTO = {
  id: 42,
  title: 'Dune',
  original_title: 'Dune',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2021-10-22',
  vote_average: 8,
  vote_count: 10,
  popularity: 1,
};

describe('store persistence', () => {
  beforeEach(async () => {
    await storage.set(STORAGE_KEYS.language, null);
    await storage.set(STORAGE_KEYS.favorites, null);
  });

  it('hydrates persisted language and favorites', async () => {
    await storage.set(STORAGE_KEYS.language, 'pt-BR');
    await storage.set(STORAGE_KEYS.favorites, {
      byId: { [favorite.id]: favorite },
      allIds: [favorite.id],
    });

    const store = createTestStore();
    await hydrateStore(store);

    expect(store.getState().settings.language).toBe('pt-BR');
    expect(store.getState().favorites.allIds).toEqual([favorite.id]);
    expect(store.getState().favorites.byId[favorite.id]).toEqual(favorite);
  });

  it('keeps defaults when storage is empty or invalid', async () => {
    await storage.set(STORAGE_KEYS.language, 'fr-FR');

    const store = createTestStore();
    await hydrateStore(store);

    expect(store.getState().settings.language).toBe('es-PY');
  });
});

import { startPersistence } from '@app/store/persistence';
import { setLanguage, toggleLanguage } from '@app/store/settingsSlice';
import { toggleFavorite } from '@features/movies/store/favoritesSlice';
import { storage, STORAGE_KEYS } from '@shared/storage';
import { makeMovie, makeTestStore } from '../../test-utils';

describe('startPersistence', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('persists language and favorites whenever they change', () => {
    const store = makeTestStore();
    const setSpy = jest.spyOn(storage, 'set').mockResolvedValue();

    startPersistence(store);

    store.dispatch(setLanguage('pt-BR'));
    expect(setSpy).toHaveBeenCalledWith(STORAGE_KEYS.language, 'pt-BR');

    setSpy.mockClear();
    store.dispatch(toggleFavorite(makeMovie({ id: 5 })));
    expect(setSpy).toHaveBeenCalledWith(
      STORAGE_KEYS.favorites,
      store.getState().favorites,
    );
  });

  it('does not write when unrelated state changes', () => {
    const store = makeTestStore();
    const setSpy = jest.spyOn(storage, 'set').mockResolvedValue();

    startPersistence(store);
    store.dispatch({ type: 'noop' });

    expect(setSpy).not.toHaveBeenCalled();
  });
});

describe('settingsSlice.toggleLanguage', () => {
  it('flips between es-PY and pt-BR', () => {
    const store = makeTestStore();
    expect(store.getState().settings.language).toBe('es-PY');

    store.dispatch(toggleLanguage());
    expect(store.getState().settings.language).toBe('pt-BR');

    store.dispatch(toggleLanguage());
    expect(store.getState().settings.language).toBe('es-PY');
  });
});

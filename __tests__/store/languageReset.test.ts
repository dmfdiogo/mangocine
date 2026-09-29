import { store } from '@app/store';
import { setLanguage } from '@app/store/settingsSlice';
import {
  incrementCategoryPage,
  incrementSearchPage,
} from '@features/movies/store/moviesSlice';

describe('language change resets pagination', () => {
  it('drops pagination progress so the list restarts in the new language', () => {
    store.dispatch(incrementCategoryPage());
    store.dispatch(incrementCategoryPage());
    store.dispatch(incrementSearchPage());

    expect(store.getState().movies.categoryPage).toBeGreaterThan(1);
    expect(store.getState().movies.searchPage).toBeGreaterThan(1);

    store.dispatch(setLanguage('pt-BR'));

    expect(store.getState().movies.categoryPage).toBe(1);
    expect(store.getState().movies.searchPage).toBe(1);
  });
});

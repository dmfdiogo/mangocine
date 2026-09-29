import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { FavoritesScreen } from '@features/favorites';
import { rootReducer } from '@app/store/rootReducer';
import { toggleFavorite } from '@features/movies/store/favoritesSlice';
import { MovieDTO } from '@features/movies/api/types';

const createTestStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

const movie: MovieDTO = {
  id: 7,
  title: 'Blade Runner 2049',
  original_title: 'Blade Runner 2049',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2017-10-06',
  vote_average: 8,
  vote_count: 100,
  popularity: 10,
};

const navigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as never;

const route = { key: 'favorites', name: 'Favorites' } as never;

const collectText = (
  renderer: ReactTestRenderer.ReactTestRenderer
): string[] =>
  renderer.root
    .findAllByType(Text)
    .map((node) => node.props.children)
    .flat()
    .filter((value): value is string => typeof value === 'string');

describe('FavoritesScreen', () => {
  it('shows the empty state when there are no favorites', () => {
    const store = createTestStore();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <FavoritesScreen navigation={navigation} route={route} />
        </Provider>
      );
    });

    const texts = collectText(renderer!);
    expect(texts.some((value) => value.includes('favoritos'))).toBe(true);

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('renders a card for each favorite', () => {
    const store = createTestStore();
    store.dispatch(toggleFavorite(movie));

    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <FavoritesScreen navigation={navigation} route={route} />
        </Provider>
      );
    });

    const texts = collectText(renderer!);
    expect(texts).toContain('Blade Runner 2049');

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });
});

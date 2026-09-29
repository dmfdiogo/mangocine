import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {
  MovieCard,
  MOVIE_CARD_MAX_FONT_SCALE,
} from '@features/movies/components/MovieCard';
import { rootReducer } from '@app/store/rootReducer';
import { MovieDTO } from '@features/movies/api/types';

const createTestStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

const baseMovie: MovieDTO = {
  id: 1,
  title: 'Interestelar',
  original_title: 'Interstellar',
  overview: 'Viaje espacial',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2014-11-07',
  vote_average: 8.4,
  vote_count: 1000,
  popularity: 50,
};

const renderCard = (movie: MovieDTO, onPress = jest.fn(), onPressIn = jest.fn()) => {
  const store = createTestStore();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <Provider store={store}>
        <MovieCard movie={movie} onPress={onPress} onPressIn={onPressIn} width={160} />
      </Provider>
    );
  });
  return { renderer: renderer!, onPress, onPressIn };
};

describe('MovieCard', () => {
  it('renders the movie title and release year', () => {
    const { renderer } = renderCard(baseMovie);
    const texts = renderer.root
      .findAllByType(Text)
      .map((node) => node.props.children)
      .flat();

    expect(texts).toContain('Interestelar');
    expect(texts).toContain('2014');

    // Font scaling is capped so the fixed-height card never clips text.
    const scalingCapped = renderer.root
      .findAllByType(Text)
      .some(
        (node) =>
          node.props.maxFontSizeMultiplier === MOVIE_CARD_MAX_FONT_SCALE
      );
    expect(scalingCapped).toBe(true);

    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });

  it('shows the fallback when the poster is missing', () => {
    const { renderer } = renderCard({ ...baseMovie, poster_path: null });
    const texts = renderer.root
      .findAllByType(Text)
      .map((node) => node.props.children)
      .flat();

    // No emoji anymore — the title is still shown over the poster fallback.
    expect(texts).not.toContain('🎬');
    expect(texts).toContain('Interestelar');

    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });

  it('calls onPress and onPressIn with the movie', () => {
    const { renderer, onPress, onPressIn } = renderCard(baseMovie);
    const touchables = renderer.root.findAllByType(TouchableOpacity);
    const card = touchables[0];

    ReactTestRenderer.act(() => {
      card.props.onPress();
      card.props.onPressIn();
    });

    expect(onPress).toHaveBeenCalledWith(baseMovie);
    expect(onPressIn).toHaveBeenCalledWith(baseMovie);

    ReactTestRenderer.act(() => {
      renderer.unmount();
    });
  });
});

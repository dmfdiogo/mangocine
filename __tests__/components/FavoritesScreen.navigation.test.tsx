import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { FavoritesScreen } from '@features/favorites';
import { toggleFavorite } from '@features/movies/store/favoritesSlice';
import { ROUTES } from '@navigation/routes';
import { makeMovie, makeTestStore } from '../../test-utils';

const navigateMock = jest.fn();
const goBackMock = jest.fn();
const navigation = { navigate: navigateMock, goBack: goBackMock };
const route = { key: 'favorites', name: ROUTES.FAVORITES };

const renderScreen = (withFavorites: boolean) => {
  const store = makeTestStore();
  if (withFavorites) {
    store.dispatch(toggleFavorite(makeMovie({ id: 7, title: 'Blade Runner' })));
  }
  render(
    <Provider store={store}>
      <FavoritesScreen
        navigation={navigation as never}
        route={route as never}
      />
    </Provider>,
  );
};

describe('FavoritesScreen interactions', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    goBackMock.mockClear();
  });

  it('opens the movie detail when a favorite card is pressed', () => {
    renderScreen(true);

    fireEvent.press(screen.getByTestId('movie-card-7'));

    expect(navigateMock).toHaveBeenCalledWith(
      ROUTES.MOVIE_DETAIL,
      expect.objectContaining({ movieId: 7 }),
    );
  });

  it('goes back from the header', () => {
    renderScreen(true);

    fireEvent.press(screen.getByLabelText('Atrás'));

    expect(goBackMock).toHaveBeenCalled();
  });

  it('sends the user to the catalog from the empty state', () => {
    renderScreen(false);

    fireEvent.press(screen.getByText('Explorar catálogo'));

    expect(navigateMock).toHaveBeenCalledWith(ROUTES.MOVIE_LIST);
  });
});

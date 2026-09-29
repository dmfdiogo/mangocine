import React from 'react';
import { FlatList } from 'react-native';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { MovieListScreen } from '@features/movies/screens/MovieListScreen';
import { selectAllFavorites } from '@features/movies/store/favoritesSlice';
import { ROUTES } from '@navigation/routes';
import {
  makeMovie,
  mockTmdbFetch,
  paginated,
  renderWithStore,
} from '../../test-utils';

const navigateMock = jest.fn();
const navigation = { navigate: navigateMock, goBack: jest.fn() };

const route = { key: 'list', name: ROUTES.MOVIE_LIST };

const renderScreen = () =>
  renderWithStore(
    <MovieListScreen navigation={navigation as never} route={route as never} />,
  );

describe('MovieListScreen (integration)', () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  it('loads the first pages of the catalog and renders the movies', async () => {
    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/popular') {
        const page = Number(url.searchParams.get('page') ?? '1');
        return page === 1
          ? paginated(1, [makeMovie({ id: 1, title: 'Interestelar' })], 2)
          : paginated(2, [makeMovie({ id: 3, title: 'Oppenheimer' })], 2);
      }
      return undefined;
    });

    renderScreen();

    expect(await screen.findByText('Interestelar')).toBeTruthy();
    // The prefetch effect appends page 2 without user interaction.
    expect(await screen.findByText('Oppenheimer')).toBeTruthy();
  });

  it('debounces the search, queries the API and navigates on card press', async () => {
    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/popular') {
        return paginated(1, [makeMovie({ id: 1, title: 'Interestelar' })], 1);
      }
      if (url.pathname === '/3/search/movie') {
        return paginated(1, [makeMovie({ id: 2, title: 'Duna: Parte 2' })], 1);
      }
      return undefined;
    });

    renderScreen();
    await screen.findByText('Interestelar');

    fireEvent.changeText(screen.getByTestId('search-input'), 'duna');

    await waitFor(
      () => expect(screen.getByText('Duna: Parte 2')).toBeTruthy(),
      { timeout: 3000 },
    );

    fireEvent.press(screen.getByTestId('movie-card-2'));

    expect(navigateMock).toHaveBeenCalledWith(
      ROUTES.MOVIE_DETAIL,
      expect.objectContaining({ movieId: 2, title: 'Duna: Parte 2' }),
    );
  });

  it('adds a movie to the favorites store when the heart is pressed', async () => {
    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/popular') {
        return paginated(1, [makeMovie({ id: 1, title: 'Interestelar' })], 1);
      }
      return undefined;
    });

    const { store } = renderScreen();
    await screen.findByText('Interestelar');

    fireEvent.press(screen.getAllByTestId('favorite-button')[0]);

    expect(selectAllFavorites(store.getState())).toEqual([
      expect.objectContaining({ id: 1, title: 'Interestelar' }),
    ]);
  });

  it('warns when the query is too short', async () => {
    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/popular') {
        return paginated(1, [makeMovie({ id: 1 })], 1);
      }
      return undefined;
    });

    renderScreen();
    await screen.findByText('Interestelar');

    fireEvent.changeText(screen.getByTestId('search-input'), 'a');

    expect(
      screen.getByText('Escribe al menos 2 caracteres para buscar.'),
    ).toBeTruthy();
  });

  it('reacts to scrolling and navigates to favorites from the menu', async () => {
    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/popular') {
        return paginated(1, [makeMovie({ id: 1 })], 1);
      }
      return undefined;
    });

    renderScreen();
    await screen.findByText('Interestelar');

    fireEvent(screen.UNSAFE_getByType(FlatList), 'scroll', {
      nativeEvent: { contentOffset: { y: 24 } },
    });

    fireEvent.press(screen.getByTestId('header-menu-button'));
    fireEvent.press(screen.getByTestId('menu-favorites'));

    expect(navigateMock).toHaveBeenCalledWith(ROUTES.FAVORITES);
  });
});

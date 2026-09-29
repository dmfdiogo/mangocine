import React from 'react';
import { Share } from 'react-native';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { MovieDetailScreen } from '@features/movies/screens/MovieDetailScreen';
import { selectAllFavorites } from '@features/movies/store/favoritesSlice';
import { ROUTES } from '@navigation/routes';
import {
  jsonResponse,
  makeCredits,
  makeMovieDetails,
  mockTmdbFetch,
  renderWithStore,
} from '../../test-utils';

const navigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as never;

const route = {
  key: 'detail',
  name: ROUTES.MOVIE_DETAIL,
  params: { movieId: 550, title: 'Clube da Luta' },
} as never;

describe('MovieDetailScreen (integration)', () => {
  it('fetches and renders details, genres and cast', async () => {
    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/550') {
        return makeMovieDetails({ genres: [{ id: 18, name: 'Drama' }] });
      }
      if (url.pathname === '/3/movie/550/credits') {
        return makeCredits();
      }
      return undefined;
    });

    renderWithStore(
      <MovieDetailScreen navigation={navigation} route={route} />,
    );

    expect(await screen.findByText('Clube da Luta')).toBeTruthy();
    expect(await screen.findByText('Drama')).toBeTruthy();
    expect(await screen.findByText('Edward Norton')).toBeTruthy();
  });

  it('favorites the movie into the normalized store', async () => {
    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/550') {
        return makeMovieDetails();
      }
      if (url.pathname === '/3/movie/550/credits') {
        return makeCredits();
      }
      return undefined;
    });

    const { store } = renderWithStore(
      <MovieDetailScreen navigation={navigation} route={route} />,
    );

    await screen.findByText('Clube da Luta');

    fireEvent.press(screen.getByTestId('favorite-button'));

    expect(selectAllFavorites(store.getState())).toEqual([
      expect.objectContaining({ id: 550 }),
    ]);
  });

  it('renders production companies and shares the movie', async () => {
    const shareSpy = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction' } as never);

    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/550') {
        return makeMovieDetails({
          production_companies: [
            {
              id: 1,
              name: 'Fox 2000 Pictures',
              logo_path: null,
              origin_country: 'US',
            },
          ],
        });
      }
      if (url.pathname === '/3/movie/550/credits') {
        return makeCredits();
      }
      return undefined;
    });

    renderWithStore(
      <MovieDetailScreen navigation={navigation} route={route} />,
    );

    expect(await screen.findByText('Fox 2000 Pictures')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Compartir'));

    await waitFor(() => expect(shareSpy).toHaveBeenCalled());
    jest.restoreAllMocks();
  });

  it('shows the error view and recovers on retry', async () => {
    let fail = true;

    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/550') {
        if (fail) {
          return jsonResponse({ status_message: 'boom' }, 500);
        }
        return makeMovieDetails();
      }
      if (url.pathname === '/3/movie/550/credits') {
        return makeCredits();
      }
      return undefined;
    });

    renderWithStore(
      <MovieDetailScreen navigation={navigation} route={route} />,
    );

    expect(await screen.findByText('Error al cargar detalles')).toBeTruthy();

    fail = false;
    fireEvent.press(screen.getByText('Reintentar'));

    expect(await screen.findByText('Clube da Luta')).toBeTruthy();
  });
});

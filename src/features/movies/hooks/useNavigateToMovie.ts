import { useCallback, useRef } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ROUTES } from '@navigation/routes';
import type { RootStackParamList } from '@navigation/types';
import type { MovieDTO } from '../api/types';

/**
 * Rapid taps on a card could push the detail screen twice. This window swallows
 * accidental double taps. Shared so the catalog and favorites grids behave the
 * same way.
 */
const NAVIGATION_THROTTLE_MS = 600;

/**
 * Builds the `handleMoviePress` callback used by the movie grids: it throttles
 * re-entrance and forwards the lightweight movie fields the detail screen uses
 * for its instant placeholder before the full details load.
 */
export const useNavigateToMovie = <RouteName extends keyof RootStackParamList>(
  navigation: NativeStackNavigationProp<RootStackParamList, RouteName>,
) => {
  const lastNavigationTime = useRef(0);

  return useCallback(
    (movie: MovieDTO) => {
      const now = Date.now();
      if (now - lastNavigationTime.current < NAVIGATION_THROTTLE_MS) {
        return;
      }
      lastNavigationTime.current = now;

      navigation.navigate(ROUTES.MOVIE_DETAIL, {
        movieId: movie.id,
        title: movie.title,
        initialPosterPath: movie.poster_path,
        initialBackdropPath: movie.backdrop_path,
        initialVoteAverage: movie.vote_average,
        initialReleaseDate: movie.release_date,
      });
    },
    [navigation],
  );
};

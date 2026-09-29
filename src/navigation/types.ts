import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ROUTES } from './routes';

export type RootStackParamList = {
  [ROUTES.WELCOME]: undefined;
  [ROUTES.MOVIE_LIST]: undefined;
  [ROUTES.FAVORITES]: undefined;
  [ROUTES.MOVIE_DETAIL]: {
    movieId: number;
    title: string;
    initialPosterPath?: string | null;
    initialBackdropPath?: string | null;
    initialVoteAverage?: number;
    initialReleaseDate?: string;
  };
};

export type WelcomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.WELCOME
>;

export type MovieListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.MOVIE_LIST
>;

export type FavoritesScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.FAVORITES
>;

export type MovieDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.MOVIE_DETAIL
>;

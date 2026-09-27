import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ROUTES } from './routes';

export type RootStackParamList = {
  [ROUTES.MOVIE_LIST]: undefined;
  [ROUTES.MOVIE_DETAIL]: {
    movieId: number;
    title: string;
    initialPosterPath?: string | null;
    initialBackdropPath?: string | null;
    initialVoteAverage?: number;
    initialReleaseDate?: string;
  };
};

export type MovieListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.MOVIE_LIST
>;

export type MovieDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.MOVIE_DETAIL
>;

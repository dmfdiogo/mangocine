import {
  favoritesSlice,
  toggleFavorite,
  removeFavorite,
  clearFavorites,
  hydrateFavorites,
  selectAllFavorites,
  selectFavoritesCount,
  selectIsFavorite,
  FavoritesState,
} from '@features/movies/store/favoritesSlice';
import { MovieDTO } from '@features/movies/api/types';
import type { RootState } from '@app/store';

const mockMovie: MovieDTO = {
  id: 101,
  title: 'Inception',
  original_title: 'Inception',
  overview: 'A thief who steals corporate secrets...',
  poster_path: '/inception.jpg',
  backdrop_path: '/inception_backdrop.jpg',
  release_date: '2010-07-16',
  vote_average: 8.8,
  vote_count: 34000,
  popularity: 120,
};

const mockMovie2: MovieDTO = {
  id: 102,
  title: 'Interstellar',
  original_title: 'Interstellar',
  overview: 'A team of explorers travel through a wormhole...',
  poster_path: '/interstellar.jpg',
  backdrop_path: '/interstellar_backdrop.jpg',
  release_date: '2014-11-07',
  vote_average: 8.6,
  vote_count: 31000,
  popularity: 110,
};

describe('favoritesSlice', () => {
  const emptyState: FavoritesState = {
    byId: {},
    allIds: [],
  };

  it('adds a movie to favorites on first toggle', () => {
    const nextState = favoritesSlice.reducer(emptyState, toggleFavorite(mockMovie));
    expect(nextState.byId[101]).toEqual(mockMovie);
    expect(nextState.allIds).toEqual([101]);
  });

  it('removes a movie from favorites on second toggle', () => {
    const populatedState: FavoritesState = {
      byId: { 101: mockMovie },
      allIds: [101],
    };
    const nextState = favoritesSlice.reducer(populatedState, toggleFavorite(mockMovie));
    expect(nextState.byId[101]).toBeUndefined();
    expect(nextState.allIds).toEqual([]);
  });

  it('handles removeFavorite by movieId', () => {
    const populatedState: FavoritesState = {
      byId: { 101: mockMovie, 102: mockMovie2 },
      allIds: [102, 101],
    };
    const nextState = favoritesSlice.reducer(populatedState, removeFavorite(101));
    expect(nextState.byId[101]).toBeUndefined();
    expect(nextState.byId[102]).toEqual(mockMovie2);
    expect(nextState.allIds).toEqual([102]);
  });

  it('handles clearFavorites', () => {
    const populatedState: FavoritesState = {
      byId: { 101: mockMovie },
      allIds: [101],
    };
    const nextState = favoritesSlice.reducer(populatedState, clearFavorites());
    expect(nextState.byId).toEqual({});
    expect(nextState.allIds).toEqual([]);
  });

  it('hydrateFavorites drops allIds without a matching entity', () => {
    const nextState = favoritesSlice.reducer(
      emptyState,
      hydrateFavorites({
        byId: { 101: mockMovie },
        allIds: [101, 999],
      })
    );

    expect(nextState.byId[101]).toEqual(mockMovie);
    expect(nextState.allIds).toEqual([101]);
  });

  describe('memoized selectors', () => {
    const mockRootState = {
      favorites: {
        byId: { 101: mockMovie, 102: mockMovie2 },
        allIds: [101, 102],
      },
    } as unknown as RootState;

    it('selectAllFavorites returns array of movies', () => {
      const allFavs = selectAllFavorites(mockRootState);
      expect(allFavs).toHaveLength(2);
      expect(allFavs[0]).toEqual(mockMovie);
      expect(allFavs[1]).toEqual(mockMovie2);
    });

    it('selectFavoritesCount returns total count', () => {
      expect(selectFavoritesCount(mockRootState)).toBe(2);
    });

    it('selectIsFavorite returns true for favorited movie and false otherwise', () => {
      expect(selectIsFavorite(101)(mockRootState)).toBe(true);
      expect(selectIsFavorite(999)(mockRootState)).toBe(false);
    });
  });
});

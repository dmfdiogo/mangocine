import { moviesApi } from '@features/movies/api/moviesApi';
import {
  makeMovie,
  makeTestStore,
  mockTmdbFetch,
  paginated,
} from '../../test-utils';

describe('moviesApi pagination', () => {
  it('appends pages, dedupes overlapping ids and replaces on page 1', async () => {
    mockTmdbFetch(url => {
      if (url.pathname !== '/3/movie/popular') {
        return undefined;
      }
      const page = Number(url.searchParams.get('page') ?? '1');
      if (page === 1) {
        return paginated(1, [makeMovie({ id: 1 }), makeMovie({ id: 2 })], 3);
      }
      // Page 2 intentionally repeats id 2 to exercise the dedupe filter.
      return paginated(page, [makeMovie({ id: 2 }), makeMovie({ id: 3 })], 3);
    });

    const store = makeTestStore();
    const query = moviesApi.endpoints.getMoviesByCategory;
    const select = (page: number) =>
      query.select({ category: 'popular', page })(store.getState());

    await store
      .dispatch(query.initiate({ category: 'popular', page: 1 }))
      .unwrap();
    await store
      .dispatch(query.initiate({ category: 'popular', page: 2 }))
      .unwrap();

    expect(select(2).data?.results.map(movie => movie.id)).toEqual([1, 2, 3]);

    // Requesting page 1 again resets the accumulated cache.
    await store
      .dispatch(query.initiate({ category: 'popular', page: 1 }))
      .unwrap();

    expect(select(1).data?.results.map(movie => movie.id)).toEqual([1, 2]);
  });

  it('shares one cache entry per normalized search term', async () => {
    const fetchMock = mockTmdbFetch(url => {
      if (url.pathname !== '/3/search/movie') {
        return undefined;
      }
      const page = Number(url.searchParams.get('page') ?? '1');
      return paginated(1, [makeMovie({ id: 10 + page })], 3);
    });

    const store = makeTestStore();
    const query = moviesApi.endpoints.searchMovies;

    await store.dispatch(query.initiate({ query: 'Duna', page: 1 })).unwrap();
    await store
      .dispatch(query.initiate({ query: '  duna  ', page: 2 }))
      .unwrap();

    const entry = query.select({ query: 'duna', page: 2 })(store.getState());
    expect(entry.data?.results.map(movie => movie.id)).toEqual([11, 12]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('scopes now_playing by region and excludes adult results in search', async () => {
    const seen: URL[] = [];
    mockTmdbFetch(url => {
      seen.push(url);
      if (url.pathname === '/3/movie/now_playing') {
        return paginated(1, [makeMovie({ id: 1 })], 1);
      }
      if (url.pathname === '/3/search/movie') {
        return paginated(1, [makeMovie({ id: 2 })], 1);
      }
      return undefined;
    });

    const store = makeTestStore();

    await store
      .dispatch(
        moviesApi.endpoints.getMoviesByCategory.initiate({
          category: 'now_playing',
          page: 1,
          region: 'BR',
        }),
      )
      .unwrap();

    await store
      .dispatch(
        moviesApi.endpoints.searchMovies.initiate({
          query: 'duna',
          page: 1,
          region: 'BR',
        }),
      )
      .unwrap();

    const nowPlayingUrl = seen.find(u => u.pathname === '/3/movie/now_playing');
    const searchUrl = seen.find(u => u.pathname === '/3/search/movie');

    expect(nowPlayingUrl?.searchParams.get('region')).toBe('BR');
    expect(searchUrl?.searchParams.get('region')).toBe('BR');
    expect(searchUrl?.searchParams.get('include_adult')).toBe('false');
  });

  it('does not send region to categories that ignore it', async () => {
    let seenUrl: URL | undefined;
    mockTmdbFetch(url => {
      seenUrl = url;
      return paginated(1, [makeMovie({ id: 1 })], 1);
    });

    const store = makeTestStore();
    await store
      .dispatch(
        moviesApi.endpoints.getMoviesByCategory.initiate({
          category: 'popular',
          page: 1,
          region: 'BR',
        }),
      )
      .unwrap();

    expect(seenUrl?.searchParams.has('region')).toBe(false);
  });
});

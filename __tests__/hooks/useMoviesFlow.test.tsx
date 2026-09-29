import { waitFor, act } from '@testing-library/react-native';
import { useMoviesFlow } from '@features/movies/hooks/useMoviesFlow';
import {
  jsonResponse,
  makeMovie,
  mockTmdbFetch,
  paginated,
  renderHookWithStore,
} from '../../test-utils';

const moviesPage = (page: number, ids: number[], totalPages = 2) =>
  paginated(
    page,
    ids.map(id => makeMovie({ id, title: `Movie ${id}` })),
    totalPages,
  );

describe('useMoviesFlow (ViewModel)', () => {
  it('loads the first page and prefetches the next ones', async () => {
    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/popular') {
        const page = Number(url.searchParams.get('page') ?? '1');
        return moviesPage(page, page === 1 ? [1] : [2], 2);
      }
      return undefined;
    });

    const { result } = renderHookWithStore(() => useMoviesFlow());

    await waitFor(() => expect(result.current.movies).toHaveLength(2));
    expect(result.current.isSearchMode).toBe(false);
    expect(result.current.selectedCategory).toBe('popular');
    expect(result.current.isLoading).toBe(false);
  });

  it('switches category and fetches the new list', async () => {
    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/popular') {
        return moviesPage(1, [1], 1);
      }
      if (url.pathname === '/3/movie/top_rated') {
        return paginated(
          1,
          [makeMovie({ id: 99, title: 'Top Rated Movie' })],
          1,
        );
      }
      return undefined;
    });

    const { result } = renderHookWithStore(() => useMoviesFlow());

    await waitFor(() =>
      expect(result.current.movies[0]?.title).toBe('Movie 1'),
    );

    act(() => result.current.onCategoryChange('top_rated'));

    await waitFor(() =>
      expect(result.current.movies[0]?.title).toBe('Top Rated Movie'),
    );
    expect(result.current.selectedCategory).toBe('top_rated');
  });

  it('enters search mode after the debounce and clears back to the catalog', async () => {
    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/popular') {
        return moviesPage(1, [1], 1);
      }
      if (url.pathname === '/3/search/movie') {
        return paginated(
          1,
          [makeMovie({ id: 500, title: 'Duna: Parte 2' })],
          1,
        );
      }
      return undefined;
    });

    const { result } = renderHookWithStore(() => useMoviesFlow());
    await waitFor(() => expect(result.current.movies).toHaveLength(1));

    act(() => result.current.onSearchChange('duna'));

    await waitFor(() => expect(result.current.isSearchMode).toBe(true), {
      timeout: 3000,
    });
    await waitFor(() =>
      expect(result.current.movies[0]?.title).toBe('Duna: Parte 2'),
    );

    act(() => result.current.onClearSearch());

    await waitFor(() => expect(result.current.isSearchMode).toBe(false));
  });

  it('flags a too-short query without entering search mode', async () => {
    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/popular') {
        return moviesPage(1, [1], 1);
      }
      return undefined;
    });

    const { result } = renderHookWithStore(() => useMoviesFlow());
    await waitFor(() => expect(result.current.movies).toHaveLength(1));

    act(() => result.current.onSearchChange('a'));

    expect(result.current.isSearchTooShort).toBe(true);
    expect(result.current.isSearchMode).toBe(false);
  });

  it('loads more pages on end reached', async () => {
    mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/popular') {
        const page = Number(url.searchParams.get('page') ?? '1');
        return moviesPage(page, [page], 7);
      }
      return undefined;
    });

    const { result } = renderHookWithStore(() => useMoviesFlow());

    // The warm-up prefetches the first 5 pages.
    await waitFor(() => expect(result.current.movies).toHaveLength(5));

    act(() => result.current.onEndReached());

    await waitFor(() => expect(result.current.movies).toHaveLength(6));
  });

  it('flags a pagination error and recovers on retry', async () => {
    let failPage2 = true;

    mockTmdbFetch(url => {
      if (url.pathname !== '/3/movie/popular') {
        return undefined;
      }
      const page = Number(url.searchParams.get('page') ?? '1');
      if (page === 1) {
        return moviesPage(1, [1], 2);
      }
      if (page === 2 && failPage2) {
        return jsonResponse({ status_message: 'boom' }, 500);
      }
      return moviesPage(2, [2], 2);
    });

    const { result } = renderHookWithStore(() => useMoviesFlow());

    await waitFor(() => expect(result.current.isPaginationError).toBe(true));

    failPage2 = false;
    act(() => result.current.onRetryPagination());

    await waitFor(() => expect(result.current.movies).toHaveLength(2));
    expect(result.current.isPaginationError).toBe(false);
  });

  it('refreshes page 1 and prefetches details on press-in', async () => {
    const fetchMock = mockTmdbFetch(url => {
      if (url.pathname === '/3/movie/popular') {
        return moviesPage(1, [1], 1);
      }
      if (url.pathname === '/3/movie/1') {
        return { id: 1, title: 'Movie 1', genres: [] };
      }
      if (url.pathname === '/3/movie/1/credits') {
        return { id: 1, cast: [] };
      }
      return undefined;
    });

    const { result } = renderHookWithStore(() => useMoviesFlow());
    await waitFor(() => expect(result.current.movies).toHaveLength(1));

    await act(async () => {
      await result.current.onRefresh();
    });
    expect(result.current.isRefreshing).toBe(false);

    const callsBeforePrefetch = fetchMock.mock.calls.length;
    act(() => result.current.onMoviePrefetch(result.current.movies[0]));

    // Prefetch warms details + credits for the touched movie.
    await waitFor(() =>
      expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(
        callsBeforePrefetch + 2,
      ),
    );
  });
});

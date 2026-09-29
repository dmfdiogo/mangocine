import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, renderHook } from '@testing-library/react-native';
import { rootReducer } from '@app/store/rootReducer';
import { moviesApi } from '@features/movies/api/moviesApi';
import type {
  MovieDTO,
  MovieDetailsDTO,
  MovieCreditsDTO,
  PaginatedResponse,
  MovieCategory,
} from '@features/movies/api/types';

const createStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ serializableCheck: false }).concat(
        moviesApi.middleware,
      ),
  });

/** Full store type (including thunk middleware) so `dispatch(...).unwrap()` is typed. */
export type TestStore = ReturnType<typeof createStore>;

const liveStores: TestStore[] = [];

/** Redux store wired with the RTK Query middleware but no persistence side effects. */
export const makeTestStore = (): TestStore => {
  const store = createStore();
  liveStores.push(store);
  return store;
};

// RTK Query keeps internal subscription timers alive; tearing the cache down
// after each test lets the Jest environment exit cleanly.
afterEach(() => {
  liveStores.splice(0).forEach(store => {
    store.dispatch(moviesApi.util.resetApiState());
  });
});

export interface RenderWithStoreOptions {
  store?: TestStore;
}

/** Renders a screen/component inside a real Redux store. */
export const renderWithStore = (
  ui: React.ReactElement,
  { store = makeTestStore() }: RenderWithStoreOptions = {},
) => {
  const utils = render(<Provider store={store}>{ui}</Provider>);
  return { store, ...utils };
};

/** Renders a hook inside a real Redux store (for flow/ViewModel hooks). */
export const renderHookWithStore = <T,>(
  callback: () => T,
  { store = makeTestStore() }: RenderWithStoreOptions = {},
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, ...renderHook(callback, { wrapper }) };
};

const makeResponse = (body: unknown, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type' ? 'application/json' : null,
    },
    clone() {
      return this;
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response);

const isResponseLike = (value: unknown): value is Response =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Response).json === 'function' &&
  'status' in value;

/**
 * Installs a `fetch` mock driven by a URL handler.
 *
 * The handler can return a plain body (wrapped as a 200) or a full `Response`
 * built with `jsonResponse(body, status)` for error/status cases. Returning
 * `undefined` yields a 404, mirroring an unknown TMDB route.
 */
export const mockTmdbFetch = (handler: (url: URL) => unknown): jest.Mock => {
  const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
    const raw =
      typeof input === 'string'
        ? input
        : input instanceof URL
        ? input.toString()
        : (input as Request).url;
    const url = new URL(raw);
    const result = handler(url);
    if (result === undefined) {
      return makeResponse(
        { status_code: 34, status_message: 'Not found' },
        404,
      );
    }
    return isResponseLike(result) ? result : makeResponse(result);
  });

  (globalThis as unknown as { fetch: unknown }).fetch = fetchMock;
  return fetchMock;
};

export const jsonResponse = makeResponse;

/*
 * Fixture factories — keep API payloads realistic without coupling tests to
 * every field.
 */

export const makeMovie = (overrides: Partial<MovieDTO> = {}): MovieDTO => ({
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
  ...overrides,
});

export const paginated = (
  page: number,
  results: MovieDTO[],
  totalPages = 2,
): PaginatedResponse<MovieDTO> => ({
  page,
  results,
  total_pages: totalPages,
  total_results: results.length,
});

export const makeMovieDetails = (
  overrides: Partial<MovieDetailsDTO> = {},
): MovieDetailsDTO => ({
  id: 550,
  title: 'Clube da Luta',
  original_title: 'Fight Club',
  overview: 'Um funcionário insone...',
  tagline: 'Mischief. Mayhem. Soap.',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '1999-10-15',
  vote_average: 8.4,
  vote_count: 28000,
  popularity: 60,
  runtime: 139,
  status: 'Released',
  genres: [{ id: 18, name: 'Drama' }],
  production_companies: [],
  original_language: 'en',
  ...overrides,
});

export const makeCredits = (
  overrides: Partial<MovieCreditsDTO> = {},
): MovieCreditsDTO => ({
  id: 550,
  cast: [
    {
      id: 1,
      name: 'Edward Norton',
      character: 'Narrador',
      profile_path: null,
      order: 0,
    },
  ],
  ...overrides,
});

/** Convenience matcher for the category endpoints in a fetch handler. */
export const categoryPath = (category: MovieCategory): string => {
  const map: Record<MovieCategory, string> = {
    popular: '/movie/popular',
    top_rated: '/movie/top_rated',
    now_playing: '/movie/now_playing',
    upcoming: '/movie/upcoming',
  };
  return map[category];
};

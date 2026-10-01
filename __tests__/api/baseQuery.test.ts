import { tmdbBaseQuery } from '@shared/api/baseQuery';
import { ENV } from '@app/config/env';
import { mockTmdbFetch } from '../../test-utils';

interface FakeState {
  settings?: { language?: string };
}

const runQuery = async (
  args: Parameters<typeof tmdbBaseQuery>[0],
  state: FakeState,
) => {
  let captured = '';
  mockTmdbFetch(url => {
    captured = url.toString();
    return { ok: true };
  });

  const api = {
    getState: () => state,
    signal: new AbortController().signal,
  };
  const result = await tmdbBaseQuery(args, api as never, {} as never);
  return { result, params: new URL(captured).searchParams };
};

describe('tmdbBaseQuery', () => {
  it('injects the api_key and resolves the TMDB locale from the app language', async () => {
    const { params } = await runQuery('/movie/popular', {
      settings: { language: 'pt-BR' },
    });

    expect(params.get('language')).toBe('pt-BR');
    expect(params.get('api_key')).toBe(ENV.TMDB_API_KEY);
  });

  it('maps es-PY to the es-ES TMDB catalog', async () => {
    const { params } = await runQuery('/movie/popular', {
      settings: { language: 'es-PY' },
    });

    expect(params.get('language')).toBe('es-ES');
  });

  it('falls back to the default language for unknown values', async () => {
    const { params } = await runQuery('/movie/popular', {
      settings: { language: 'fr-FR' },
    });

    expect(params.get('language')).toBe(ENV.TMDB_DEFAULT_LANGUAGE);
  });

  it('never overwrites params the caller provided', async () => {
    const { params } = await runQuery(
      { url: '/movie/popular', params: { language: 'de-DE', page: 4 } },
      { settings: { language: 'pt-BR' } },
    );

    expect(params.get('language')).toBe('de-DE');
    expect(params.get('page')).toBe('4');
  });

  it('accepts a plain string url', async () => {
    const { result } = await runQuery('/movie/popular', {
      settings: { language: 'pt-BR' },
    });

    expect(result).toMatchObject({ data: { ok: true } });
  });
});

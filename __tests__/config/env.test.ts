declare const process: { env: Record<string, string | undefined> };

describe('ENV', () => {
  const originalKey = process.env.TMDB_API_KEY;
  const originalToken = process.env.TMDB_API_READ_ACCESS_TOKEN;

  afterEach(() => {
    process.env.TMDB_API_KEY = originalKey;
    process.env.TMDB_API_READ_ACCESS_TOKEN = originalToken;
    jest.resetModules();
  });

  it('prefers credentials provided via process.env', () => {
    jest.resetModules();
    process.env.TMDB_API_KEY = 'key-from-env';
    process.env.TMDB_API_READ_ACCESS_TOKEN = 'token-from-env';

    const { ENV } = require('@app/config/env');

    expect(ENV.TMDB_API_KEY).toBe('key-from-env');
    expect(ENV.TMDB_BEARER_TOKEN).toBe('token-from-env');
    expect(ENV.TMDB_BASE_URL).toBe('https://api.themoviedb.org/3');
  });

  it('falls back to the public demo key when no env is provided', () => {
    jest.resetModules();
    delete process.env.TMDB_API_KEY;
    delete process.env.TMDB_API_READ_ACCESS_TOKEN;

    const { ENV } = require('@app/config/env');

    expect(ENV.TMDB_API_KEY).toHaveLength(32);
    expect(ENV.TMDB_BEARER_TOKEN).toBe('');
  });
});

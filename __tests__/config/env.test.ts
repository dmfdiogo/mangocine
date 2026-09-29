import { ENV } from '@app/config/env';

describe('ENV', () => {
  it('exposes the TMDB endpoints and default locale', () => {
    expect(ENV.TMDB_BASE_URL).toBe('https://api.themoviedb.org/3');
    expect(ENV.TMDB_IMAGE_BASE_URL).toBe('https://image.tmdb.org/t/p');
    expect(ENV.DEFAULT_LANGUAGE).toBe('es-ES');
  });

  it('ships a public 32-char demo key so the app runs out-of-the-box', () => {
    expect(ENV.TMDB_API_KEY).toHaveLength(32);
  });
});

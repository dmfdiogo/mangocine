import { getPosterUrl, getBackdropUrl } from '@shared/utils/imageHelpers';
import { ENV } from '@app/config/env';

describe('imageHelpers utility', () => {
  describe('getPosterUrl', () => {
    it('constructs correct URL with default size w342', () => {
      const url = getPosterUrl('/sample_poster.jpg');
      expect(url).toBe(`${ENV.TMDB_IMAGE_BASE_URL}/w342/sample_poster.jpg`);
    });

    it('constructs correct URL with custom size', () => {
      const url = getPosterUrl('/sample_poster.jpg', 'w500');
      expect(url).toBe(`${ENV.TMDB_IMAGE_BASE_URL}/w500/sample_poster.jpg`);
    });

    it('returns null when path is missing', () => {
      expect(getPosterUrl(null)).toBeNull();
      expect(getPosterUrl(undefined)).toBeNull();
      expect(getPosterUrl('')).toBeNull();
    });

    it('passes absolute URLs through untouched', () => {
      expect(getPosterUrl('https://cdn.example.com/poster.jpg')).toBe(
        'https://cdn.example.com/poster.jpg'
      );
    });
  });

  describe('getBackdropUrl', () => {
    it('constructs correct URL with default size w780', () => {
      const url = getBackdropUrl('/sample_backdrop.jpg');
      expect(url).toBe(`${ENV.TMDB_IMAGE_BASE_URL}/w780/sample_backdrop.jpg`);
    });

    it('constructs correct URL with original size', () => {
      const url = getBackdropUrl('/sample_backdrop.jpg', 'original');
      expect(url).toBe(`${ENV.TMDB_IMAGE_BASE_URL}/original/sample_backdrop.jpg`);
    });

    it('returns null when path is missing', () => {
      expect(getBackdropUrl(null)).toBeNull();
      expect(getBackdropUrl(undefined)).toBeNull();
      expect(getBackdropUrl('')).toBeNull();
    });

    it('passes absolute URLs through untouched', () => {
      expect(getBackdropUrl('http://cdn.example.com/backdrop.jpg')).toBe(
        'http://cdn.example.com/backdrop.jpg'
      );
    });
  });
});

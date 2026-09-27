import {
  formatRating,
  formatReleaseYear,
  formatFullDate,
  formatRuntime,
} from '@shared/utils/formatters';

describe('formatters utility', () => {
  describe('formatRating', () => {
    it('formats a decimal number to 1 decimal place', () => {
      expect(formatRating(8.24)).toBe('8.2');
      expect(formatRating(7)).toBe('7.0');
    });

    it('returns N/A when rating is 0, null, or undefined', () => {
      expect(formatRating(0)).toBe('N/A');
      expect(formatRating(null)).toBe('N/A');
      expect(formatRating(undefined)).toBe('N/A');
    });
  });

  describe('formatReleaseYear', () => {
    it('extracts year from YYYY-MM-DD format', () => {
      expect(formatReleaseYear('2024-05-15')).toBe('2024');
      expect(formatReleaseYear('1999-12-31')).toBe('1999');
    });

    it('returns N/D when date is missing or empty', () => {
      expect(formatReleaseYear('')).toBe('N/D');
      expect(formatReleaseYear(null)).toBe('N/D');
      expect(formatReleaseYear(undefined)).toBe('N/D');
    });
  });

  describe('formatFullDate', () => {
    it('formats date correctly in Spanish locale', () => {
      const result = formatFullDate('2024-01-15', 'es-ES');
      expect(result.toLowerCase()).toContain('2024');
      expect(result.toLowerCase()).toContain('15');
    });

    it('returns fallback message when date is missing', () => {
      expect(formatFullDate(null)).toBe('Fecha no disponible');
      expect(formatFullDate('')).toBe('Fecha no disponible');
    });
  });

  describe('formatRuntime', () => {
    it('formats minutes into hours and minutes', () => {
      expect(formatRuntime(125)).toBe('2h 5m');
      expect(formatRuntime(60)).toBe('1h 0m');
      expect(formatRuntime(45)).toBe('45m');
    });

    it('returns null when minutes are null, zero or undefined', () => {
      expect(formatRuntime(null)).toBeNull();
      expect(formatRuntime(0)).toBeNull();
      expect(formatRuntime(undefined)).toBeNull();
    });
  });
});

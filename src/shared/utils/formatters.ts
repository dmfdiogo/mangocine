export const formatRating = (voteAverage: number | null | undefined): string => {
  if (voteAverage === undefined || voteAverage === null) {
    return 'N/A';
  }
  const numeric = Number(voteAverage);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 'N/A';
  }
  return numeric.toFixed(1);
};

export const formatReleaseYear = (
  dateString?: string | null,
  fallback = 'N/D'
): string => {
  if (!dateString) return fallback;
  const match = /^(\d{4})(?:-\d{2}-\d{2})?$/.exec(dateString.trim());
  if (!match || match[1] === '0000') return fallback;
  return match[1];
};

export const formatFullDate = (
  dateString?: string | null,
  locale = 'es-ES',
  fallback = 'Fecha no disponible'
): string => {
  if (!dateString) return fallback;
  const parts = dateString.split('-').map(Number);
  if (parts.length !== 3) return dateString;

  const [year, month, day] = parts;
  if (!year || !month || !day) return dateString;

  try {
    const date = new Date(year, month - 1, day);
    const isRealDate =
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
    if (!isRealDate) return dateString;

    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatRuntime = (minutes?: number | null): string | null => {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
};

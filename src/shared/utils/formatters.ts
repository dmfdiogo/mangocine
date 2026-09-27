export const formatRating = (voteAverage: number | null | undefined): string => {
  if (voteAverage === undefined || voteAverage === null || voteAverage === 0) {
    return 'N/A';
  }
  return voteAverage.toFixed(1);
};

export const formatReleaseYear = (dateString?: string | null): string => {
  if (!dateString) return 'N/D';
  const year = dateString.split('-')[0];
  return year || 'N/D';
};

export const formatFullDate = (dateString?: string | null, locale = 'es-ES'): string => {
  if (!dateString) return 'Fecha no disponible';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
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

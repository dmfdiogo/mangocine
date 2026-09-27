export const colors = {
  background: '#0B0E14',
  surface: '#151921',
  surfaceElevated: '#1F242F',
  surfaceHighlight: '#2A313F',

  primary: '#E50914',
  primaryLight: '#FF3D47',
  primaryDark: '#B20710',

  secondary: '#38BDF8',
  accent: '#F59E0B',
  star: '#FBBF24',

  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  border: '#272E3F',
  borderLight: '#3B4459',

  error: '#EF4444',
  errorBackground: 'rgba(239, 68, 68, 0.15)',
  success: '#10B981',

  overlay: 'rgba(11, 14, 20, 0.75)',
  skeleton: '#1A202C',
  skeletonHighlight: '#2D3748',
} as const;

export type ColorType = typeof colors;

export const colors = {
  background: '#0B0E14',
  surface: '#151921',
  surfaceElevated: '#1F242F',
  surfaceHighlight: '#2A313F',

  // Primary is the mango orange (brand color, sampled from the illustration).
  primary: '#F28E36',
  primaryLight: '#F6A85A',
  primaryDark: '#D9601F',
  // Readable foreground on top of `primary` (white fails contrast on orange).
  onPrimary: '#1A1207',

  mango: '#F28E36',
  mangoDark: '#EC5D33',

  secondary: '#38BDF8',
  accent: '#F59E0B',
  star: '#FBBF24',

  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  // Bumped from #64748B to meet WCAG AA for small text on the dark background.
  textMuted: '#8A97AC',

  border: '#272E3F',
  borderLight: '#3B4459',

  error: '#EF4444',
  errorBackground: 'rgba(239, 68, 68, 0.15)',
  success: '#10B981',

  // Translucent scrims (poster chips, card captions, floating buttons).
  overlayStrong: 'rgba(11, 14, 20, 0.85)',
  overlayMedium: 'rgba(11, 14, 20, 0.78)',
  overlay: 'rgba(11, 14, 20, 0.75)',
  overlayFaint: 'rgba(11, 14, 20, 0.55)',

  // Brand-tinted translucent surfaces.
  primarySurface: 'rgba(242, 142, 54, 0.22)',
  primarySurfaceSoft: 'rgba(242, 142, 54, 0.16)',
  accentSurface: 'rgba(245, 158, 11, 0.2)',
  secondarySurface: 'rgba(56, 189, 248, 0.1)',

  // Translucent borders used over imagery/scrims.
  borderStar: 'rgba(251, 191, 36, 0.45)',
  borderPrimary: 'rgba(242, 142, 54, 0.7)',
  borderFrost: 'rgba(255, 255, 255, 0.18)',
  borderError: 'rgba(239, 68, 68, 0.35)',

  skeleton: '#1A202C',
  skeletonHighlight: '#2D3748',
} as const;

export type ColorType = typeof colors;

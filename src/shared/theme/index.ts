import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { elevation, radius } from './elevation';

export const theme = {
  colors,
  spacing,
  typography,
  radius,
  elevation,
} as const;

export type Theme = typeof theme;
export * from './colors';
export * from './spacing';
export * from './typography';
export * from './elevation';

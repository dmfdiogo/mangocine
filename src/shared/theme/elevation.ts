import { ViewStyle } from 'react-native';

/**
 * Neutral elevation scale (iOS shadow + Android elevation in one token).
 * Use these instead of ad-hoc shadow values so depth is consistent.
 */
export const elevation: Record<'sm' | 'md' | 'lg', ViewStyle> = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
};

/** Corner radius scale. */
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

export type ElevationType = typeof elevation;
export type RadiusType = typeof radius;

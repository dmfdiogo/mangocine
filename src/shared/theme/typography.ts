import { TextStyle } from 'react-native';

export const typography = {
  hero: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800' as TextStyle['fontWeight'],
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodyBold: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  captionBold: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  tag: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
  },
} as const;

export type TypographyType = typeof typography;

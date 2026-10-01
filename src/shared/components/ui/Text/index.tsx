import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { colors, ColorType } from '@shared/theme/colors';
import { typography, TypographyType } from '@shared/theme/typography';

/**
 * Global cap on OS font scaling. Fixed-height layouts (grid rows, header chips)
 * would clip or overlap at the extreme accessibility sizes, so text stops
 * scaling here by default. Callers can override per instance (e.g. `MovieCard`
 * uses a tighter cap for its poster overlay).
 */
export const APP_TEXT_MAX_FONT_SCALE = 1.3;

export interface AppTextProps extends RNTextProps {
  variant?: keyof TypographyType;
  color?: keyof ColorType;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'text',
  align = 'left',
  maxFontSizeMultiplier = APP_TEXT_MAX_FONT_SCALE,
  style,
  children,
  ...props
}) => {
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        typography[variant],
        { color: colors[color], textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

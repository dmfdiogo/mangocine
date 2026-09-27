import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, ColorType } from '@shared/theme/colors';
import { typography, TypographyType } from '@shared/theme/typography';

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
  style,
  children,
  ...props
}) => {
  return (
    <RNText
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

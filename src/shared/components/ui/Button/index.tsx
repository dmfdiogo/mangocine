import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  PressableProps,
} from 'react-native';
import { AppText } from '../Text';
import { PressableScale } from '@shared/components/ui/PressableScale';
import { colors, ColorType } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { elevation, radius } from '@shared/theme/elevation';

export interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  onPress,
  ...props
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: colors.surfaceElevated };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.borderLight,
        };
      case 'primary':
      default:
        return {
          backgroundColor: colors.primary,
          ...elevation.md,
        };
    }
  };

  const getTextColor = (): keyof ColorType => {
    // Dark text on the (orange) primary; light text on darker surfaces.
    return variant === 'primary' ? 'onPrimary' : 'text';
  };

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getContainerStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors[getTextColor()]} size="small" />
      ) : (
        <AppText variant="bodyBold" color={getTextColor()}>
          {title}
        </AppText>
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
});

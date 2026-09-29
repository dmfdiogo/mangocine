import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '../Text';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { radius } from '@shared/theme/elevation';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'rating' | 'outline' | 'surface';
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'surface',
  style,
  icon,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.secondary };
      case 'rating':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          borderWidth: 1,
          borderColor: colors.star,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.borderLight,
        };
      case 'surface':
      default:
        return {
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return 'onPrimary';
      case 'rating':
        return 'star';
      case 'secondary':
        return 'text';
      default:
        return 'textSecondary';
    }
  };

  return (
    <View style={[styles.container, getBadgeStyle(), style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <AppText variant="tag" color={getTextColor()}>
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
});

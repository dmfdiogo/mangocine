import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { spacing } from '@shared/theme/spacing';
import { elevation, radius } from '@shared/theme/elevation';
import { formatRating } from '@shared/utils/formatters';

export interface RatingBadgeProps {
  rating: number | null | undefined;
  style?: ViewStyle;
  size?: 'small' | 'medium';
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  style,
  size = 'small',
}) => {
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.container,
        isSmall ? styles.containerSmall : styles.containerMedium,
        style,
      ]}
    >
      <AppText
        variant={isSmall ? 'tag' : 'captionBold'}
        color="star"
        style={styles.star}
      >
        ★
      </AppText>
      <AppText
        variant={isSmall ? 'tag' : 'captionBold'}
        color="text"
        style={styles.value}
      >
        {formatRating(rating)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 14, 20, 0.85)',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.45)',
    ...elevation.sm,
  },
  containerSmall: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  containerMedium: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  star: {
    marginRight: 3,
  },
  value: {
    fontVariant: ['tabular-nums'],
  },
});

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { elevation, radius } from '@shared/theme/elevation';
import { formatRating } from '@shared/utils/formatters';

export interface RatingBadgeProps {
  rating: number | null | undefined;
  style?: ViewStyle;
  size?: 'small' | 'medium';
  /** Localized label shown when there is no valid rating (defaults to 'N/A'). */
  emptyLabel?: string;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  style,
  size = 'small',
  emptyLabel,
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
        {formatRating(rating, emptyLabel)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlayStrong,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStar,
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

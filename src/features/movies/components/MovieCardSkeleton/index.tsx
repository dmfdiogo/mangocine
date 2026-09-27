import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

export interface MovieCardSkeletonProps {
  width?: number;
}

export const MovieCardSkeleton: React.FC<MovieCardSkeletonProps> = ({ width }) => {
  return (
    <View style={[styles.card, width ? { width } : undefined]}>
      <View style={styles.posterSkeleton} />
      <View style={styles.infoSkeleton}>
        <View style={styles.titleLine1} />
        <View style={styles.titleLine2} />
        <View style={styles.yearLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  posterSkeleton: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: colors.surfaceElevated,
  },
  infoSkeleton: {
    padding: spacing.sm,
    minHeight: 64,
  },
  titleLine1: {
    height: 12,
    width: '85%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
    marginBottom: 6,
  },
  titleLine2: {
    height: 12,
    width: '60%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
    marginBottom: 8,
  },
  yearLine: {
    height: 10,
    width: '35%',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 4,
  },
});

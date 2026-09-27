import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

export interface MovieCardSkeletonProps {
  width?: number;
}

export const MovieCardSkeleton: React.FC<MovieCardSkeletonProps> = ({ width }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim]);

  return (
    <View style={[styles.card, width ? { width } : undefined]}>
      <Animated.View style={[styles.posterSkeleton, { opacity: pulseAnim }]} />
      <View style={styles.infoSkeleton}>
        <Animated.View style={[styles.titleLine1, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.titleLine2, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.yearLine, { opacity: pulseAnim }]} />
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
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 4,
    marginBottom: 6,
  },
  titleLine2: {
    height: 12,
    width: '60%',
    backgroundColor: colors.surfaceHighlight,
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

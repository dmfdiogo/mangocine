import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { MOVIE_CARD_BORDER_WIDTH } from '../MovieCard';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { radius } from '@shared/theme/elevation';

export interface MovieCardSkeletonProps {
  width?: number;
}

/**
 * Mirrors the editorial `MovieCard` (poster + overlaid lines) so the loading
 * grid doesn't jump when real cards mount.
 */
export const MovieCardSkeleton: React.FC<MovieCardSkeletonProps> = ({
  width,
}) => {
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
      ]),
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim]);

  return (
    <View style={[styles.card, width ? { width } : undefined]}>
      <View style={styles.poster}>
        <Animated.View style={[styles.titleLine, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.yearLine, { opacity: pulseAnim }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: MOVIE_CARD_BORDER_WIDTH,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'flex-end',
    padding: spacing.sm,
    overflow: 'hidden',
  },
  titleLine: {
    height: 11,
    width: '85%',
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceHighlight,
    marginBottom: 6,
  },
  yearLine: {
    height: 9,
    width: '40%',
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceHighlight,
  },
});

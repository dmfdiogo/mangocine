import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@shared/components/ui/Text';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { elevation, radius } from '@shared/theme/elevation';
import { usePerfMonitor } from './usePerfMonitor';

const fpsColor = (fps: number): string => {
  if (fps >= 55) return colors.success;
  if (fps >= 45) return colors.accent;
  return colors.error;
};

/**
 * Dev-only heads-up display for frame pacing. Mounted once at the app root and
 * never rendered in production (`__DEV__` branch + disabled monitor).
 *
 * Shows a small color-coded pill with the live FPS (green ≥55, amber ≥45, red
 * below). It is non-interactive so it never steals touches from the UI.
 */
export const PerfOverlay: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { stats } = usePerfMonitor({ enabled: __DEV__ });

  if (!__DEV__) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[styles.wrapper, { top: insets.top + spacing.sm }]}
    >
      <View style={styles.pill}>
        <View style={[styles.dot, { backgroundColor: fpsColor(stats.fps) }]} />
        <AppText variant="tag" color="text" style={styles.pillText}>
          {Math.round(stats.fps)} FPS
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: spacing.sm,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  pillText: {
    fontVariant: ['tabular-nums'],
  },
});

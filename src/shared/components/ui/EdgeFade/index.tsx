import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@shared/theme/colors';

export interface EdgeFadeProps {
  edge?: 'top' | 'bottom';
  height?: number;
  color?: string;
  /** Number of stacked bands used to approximate the gradient. */
  steps?: number;
  /** Opacity of the band closest to the edge. */
  maxOpacity?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Dependency-free vertical fade toward an edge, drawn with stacked translucent
 * bands. Used to blend imagery into the app background without a native
 * gradient module.
 */
export const EdgeFade: React.FC<EdgeFadeProps> = ({
  edge = 'bottom',
  height = 140,
  color = colors.background,
  steps = 24,
  maxOpacity = 1,
  style,
}) => {
  const bandHeight = height / steps;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        edge === 'bottom' ? styles.edgeBottom : styles.edgeTop,
        { height },
        style,
      ]}
    >
      {Array.from({ length: steps }).map((_, index) => {
        // index 0 starts at the edge (most opaque) and fades inward.
        // A slight ease makes the falloff look more natural than linear steps.
        const progress = Math.pow((steps - index) / steps, 1.35);
        const bandStyle: ViewStyle = {
          position: 'absolute',
          left: 0,
          right: 0,
          height: bandHeight,
          backgroundColor: color,
          opacity: progress * maxOpacity,
          ...(edge === 'bottom'
            ? { bottom: index * bandHeight }
            : { top: index * bandHeight }),
        };
        return <View key={index} style={bandStyle} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  edgeBottom: {
    bottom: 0,
  },
  edgeTop: {
    top: 0,
  },
});

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import mangoMark from '@shared/assets/mango.png';
import { colors } from '@shared/theme/colors';

export interface IconProps {
  size?: number;
  color?: string;
}

/** Drawn magnifier (no emoji, no icon library). */
export const SearchIcon: React.FC<IconProps> = ({
  size = 18,
  color = colors.textMuted,
}) => {
  const circle = size * 0.66;
  return (
    <View style={[styles.searchWrap, { width: size, height: size }]}>
      <View
        style={[
          styles.searchCircle,
          {
            width: circle,
            height: circle,
            borderRadius: circle / 2,
            borderColor: color,
            marginBottom: size * 0.18,
            marginRight: size * 0.18,
          },
        ]}
      />
      <View
        style={[
          styles.searchHandle,
          {
            right: size * 0.04,
            bottom: size * 0.16,
            width: size * 0.4,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

/** Drawn film strip, used as the poster/empty fallback. */
export const FilmIcon: React.FC<IconProps> = ({
  size = 32,
  color = colors.textMuted,
}) => {
  const height = size * 0.7;
  const hole = Math.max(3, Math.round(size * 0.11));
  const colHeight = height * 0.62;

  return (
    <View
      style={[styles.filmFrame, { width: size, height, borderColor: color }]}
    >
      <View style={[styles.filmCol, { height: colHeight }]}>
        <View
          style={[
            styles.filmHole,
            {
              width: hole,
              height: hole,
              borderRadius: hole / 2,
              backgroundColor: color,
            },
          ]}
        />
        <View
          style={[
            styles.filmHole,
            {
              width: hole,
              height: hole,
              borderRadius: hole / 2,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <View style={[styles.filmCol, { height: colHeight }]}>
        <View
          style={[
            styles.filmHole,
            {
              width: hole,
              height: hole,
              borderRadius: hole / 2,
              backgroundColor: color,
            },
          ]}
        />
        <View
          style={[
            styles.filmHole,
            {
              width: hole,
              height: hole,
              borderRadius: hole / 2,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

/** Drawn back arrow (shaft + chevron head). */
export const ArrowLeftIcon: React.FC<IconProps> = ({
  size = 20,
  color = colors.text,
}) => {
  const shaftW = size * 0.58;
  const head = size * 0.34;
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View
        style={[
          styles.line,
          styles.lineHorizontal,
          { width: shaftW, backgroundColor: color },
        ]}
      />
      <View
        style={[
          styles.chevronLeft,
          {
            width: head,
            height: head,
            borderColor: color,
            left: size * 0.12,
            top: (size - head) / 2,
          },
        ]}
      />
    </View>
  );
};

/** Drawn share/export icon (up arrow out of a tray). */
export const ShareIcon: React.FC<IconProps> = ({
  size = 20,
  color = colors.text,
}) => {
  const trayW = size * 0.6;
  const trayH = size * 0.34;
  const head = size * 0.32;
  const shaftH = size * 0.5;
  return (
    <View style={[styles.shareWrap, { width: size, height: size }]}>
      <View style={styles.shareArrow}>
        <View
          style={[
            styles.chevronUp,
            { width: head, height: head, borderColor: color },
          ]}
        />
        <View
          style={[
            styles.lineVertical,
            { height: shaftH, backgroundColor: color },
          ]}
        />
      </View>
      <View
        style={[
          styles.tray,
          {
            width: trayW,
            height: trayH,
            borderColor: color,
            left: (size - trayW) / 2,
          },
        ]}
      />
    </View>
  );
};

/** Brand mango mark (illustration asset, transparent background). */
export const MangoIcon: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <Image
    source={mangoMark}
    style={{ width: size, height: size }}
    resizeMode="contain"
  />
);

const styles = StyleSheet.create({
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    borderRadius: 1,
  },
  lineHorizontal: {
    height: 2,
  },
  lineVertical: {
    width: 2,
  },
  chevronLeft: {
    position: 'absolute',
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  tray: {
    position: 'absolute',
    bottom: 0,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  shareWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareArrow: {
    alignItems: 'center',
  },
  chevronUp: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  searchWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCircle: {
    borderWidth: 2,
  },
  searchHandle: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  filmFrame: {
    borderWidth: 2,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  filmCol: {
    justifyContent: 'space-between',
  },
  filmHole: {},
});

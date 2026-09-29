import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { Skeleton } from '@shared/components/ui/Skeleton';

export type AppImageResizeMode = 'cover' | 'contain' | 'stretch' | 'center';
export type AppImagePriority = 'low' | 'normal' | 'high';

export interface AppImageProps {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: AppImageResizeMode;
  priority?: AppImagePriority;
  /** Rendered when there is no uri or the image fails to load. */
  fallback?: React.ReactNode;
  /** Rendered while the image is loading (defaults to a Skeleton). */
  loadingComponent?: React.ReactNode;
  testID?: string;
}

type Status = 'loading' | 'loaded' | 'error';

/**
 * Thin wrapper over FastImage (memory + disk cache, priority) that adds a
 * skeleton placeholder and a fallback, so screens don't branch on load state.
 *
 * The `style` is applied to an outer View so the fallback and the skeleton
 * occupy exactly the same box as the image.
 */
export const AppImage: React.FC<AppImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  priority = 'normal',
  fallback,
  loadingComponent,
  testID,
}) => {
  const [status, setStatus] = useState<Status>(uri ? 'loading' : 'error');
  const [statusUri, setStatusUri] = useState<string | null | undefined>(uri);
  const opacity = useRef(new Animated.Value(0)).current;

  // Reset synchronously when the source changes so we never paint the previous
  // image's status (e.g. a stale error/fallback) for a frame on cell reuse.
  if (statusUri !== uri) {
    setStatusUri(uri);
    setStatus(uri ? 'loading' : 'error');
  }

  // Fade the artwork in once loaded (skeleton covers it before that).
  useEffect(() => {
    if (status === 'loaded') {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      opacity.setValue(0);
    }
  }, [status, opacity]);

  const hasImage = Boolean(uri) && status !== 'error';

  return (
    <View style={style as never}>
      {hasImage ? (
        <Animated.View style={[styles.fill, { opacity }]}>
          <FastImage
            key={uri}
            testID={testID}
            style={styles.fill as never}
            resizeMode={resizeMode}
            source={{
              uri: uri as string,
              priority: FastImage.priority[priority],
              cache: FastImage.cacheControl.immutable,
            }}
            onLoadStart={() => setStatus('loading')}
            onLoad={() => setStatus('loaded')}
            onError={() => setStatus('error')}
          />
        </Animated.View>
      ) : (
        fallback ?? null
      )}

      {hasImage &&
        status === 'loading' &&
        (loadingComponent ?? (
          <Skeleton
            width="100%"
            height="100%"
            borderRadius={0}
            style={styles.fill}
          />
        ))}
    </View>
  );
};

/** Warms the FastImage disk/memory cache for the given URLs. */
export const preloadImages = (uris: Array<string | null | undefined>): void => {
  const sources = uris
    .filter((uri): uri is string => Boolean(uri))
    .map(uri => ({ uri }));

  if (sources.length > 0) {
    FastImage.preload(sources);
  }
};

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
  },
});

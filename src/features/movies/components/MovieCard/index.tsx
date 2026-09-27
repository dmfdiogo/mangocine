import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { RatingBadge } from '../RatingBadge';
import { MovieDTO } from '@features/movies/api/types';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { getPosterUrl } from '@shared/utils/imageHelpers';
import { formatReleaseYear } from '@shared/utils/formatters';

export interface MovieCardProps {
  movie: MovieDTO;
  onPress: (movie: MovieDTO) => void;
  width?: number;
}

export const MovieCardComponent: React.FC<MovieCardProps> = ({
  movie,
  onPress,
  width,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const posterUri = getPosterUrl(movie.poster_path, 'w342');
  const releaseYear = formatReleaseYear(movie.release_date);

  const handlePress = () => {
    onPress(movie);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[styles.card, width ? { width } : undefined]}
    >
      <View style={styles.posterContainer}>
        {posterUri && !imageError ? (
          <>
            <Image
              source={{ uri: posterUri }}
              style={styles.posterImage}
              resizeMode="cover"
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            {imageLoading && (
              <View style={styles.loaderOverlay}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
          </>
        ) : (
          <View style={styles.fallbackContainer}>
            <AppText variant="title" color="textMuted">
              🎬
            </AppText>
            <AppText
              variant="tag"
              color="textMuted"
              align="center"
              numberOfLines={2}
              style={styles.fallbackTitle}
            >
              {movie.title}
            </AppText>
          </View>
        )}

        {/* Rating Badge Overlay */}
        <View style={styles.badgeOverlay}>
          <RatingBadge rating={movie.vote_average} size="small" />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <AppText
          variant="captionBold"
          color="text"
          numberOfLines={2}
          style={styles.title}
        >
          {movie.title}
        </AppText>

        <AppText variant="tag" color="textSecondary" style={styles.year}>
          {releaseYear}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

export const MovieCard = React.memo(MovieCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  posterContainer: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: colors.surfaceElevated,
    position: 'relative',
    overflow: 'hidden',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  fallbackContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  fallbackTitle: {
    marginTop: spacing.xs,
  },
  badgeOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  infoContainer: {
    padding: spacing.sm,
    minHeight: 64,
    justifyContent: 'space-between',
  },
  title: {
    lineHeight: 18,
  },
  year: {
    marginTop: spacing.xs,
  },
});

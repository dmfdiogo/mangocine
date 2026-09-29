import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { AppImage } from '@shared/components/ui/AppImage';
import { FilmIcon } from '@shared/components/ui/Icon';
import { RatingBadge } from '../RatingBadge';
import { FavoriteButton } from '../FavoriteButton';
import { MovieDTO } from '@features/movies/api/types';
import { useTranslation } from '@shared/i18n';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { elevation, radius } from '@shared/theme/elevation';
import { getPosterUrl } from '@shared/utils/imageHelpers';
import { formatReleaseYear } from '@shared/utils/formatters';

export const MOVIE_CARD_BORDER_WIDTH = 1;

/**
 * Fixed geometry: the card is just the poster (2:3) plus its border, so the
 * catalog `getItemLayout` stays exact.
 */
export const MOVIE_CARD_MAX_FONT_SCALE = 1.25;

export interface MovieCardProps {
  movie: MovieDTO;
  onPress: (movie: MovieDTO) => void;
  onPressIn?: (movie: MovieDTO) => void;
  width?: number;
}

export const MovieCardComponent: React.FC<MovieCardProps> = ({
  movie,
  onPress,
  onPressIn,
  width,
}) => {
  const { t } = useTranslation();
  const scale = useRef(new Animated.Value(1)).current;

  const posterUri = getPosterUrl(movie.poster_path, 'w342');
  const releaseYear = formatReleaseYear(movie.release_date, t('common.noYear'));

  const animateScale = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressIn = () => {
    animateScale(0.96);
    if (onPressIn) {
      onPressIn(movie);
    }
  };

  const handlePressOut = () => {
    animateScale(1);
  };

  const handlePress = () => {
    onPress(movie);
  };

  return (
    <Animated.View
      style={[
        styles.card,
        width ? { width } : undefined,
        { transform: [{ scale }] },
      ]}
    >
      <TouchableOpacity
        testID={`movie-card-${movie.id}`}
        activeOpacity={0.85}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={movie.title}
      >
        <View style={styles.posterContainer}>
          <AppImage
            uri={posterUri}
            style={styles.posterImage}
            resizeMode="cover"
            fallback={
              <View style={styles.fallback}>
                <FilmIcon size={34} />
              </View>
            }
          />

          {/* Favorite Button Overlay */}
          <View style={styles.favoriteOverlay}>
            <FavoriteButton movie={movie} size="small" />
          </View>

          {/* Rating Badge Overlay */}
          <View style={styles.badgeOverlay}>
            <RatingBadge rating={movie.vote_average} size="small" />
          </View>

          {/* Title / year overlaid on the poster */}
          <View style={styles.infoOverlay}>
            <AppText
              variant="captionBold"
              color="text"
              numberOfLines={2}
              maxFontSizeMultiplier={MOVIE_CARD_MAX_FONT_SCALE}
              style={styles.title}
            >
              {movie.title}
            </AppText>
            <AppText
              variant="tag"
              color="textSecondary"
              maxFontSizeMultiplier={MOVIE_CARD_MAX_FONT_SCALE}
              style={styles.year}
            >
              {releaseYear}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const MovieCard = React.memo(MovieCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: MOVIE_CARD_BORDER_WIDTH,
    borderColor: colors.border,
    ...elevation.lg,
  },
  posterContainer: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg - 1,
    overflow: 'hidden',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 2,
  },
  badgeOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  // A single caption container behind the title/year (no gradient bands).
  infoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(11, 14, 20, 0.78)',
  },
  title: {
    lineHeight: 17,
  },
  year: {
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
});

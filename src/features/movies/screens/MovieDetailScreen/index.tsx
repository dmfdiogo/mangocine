import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@shared/components/ui/Text';
import { Badge } from '@shared/components/ui/Badge';
import { RatingBadge } from '@features/movies/components/RatingBadge';
import { ErrorView } from '@shared/components/feedback/ErrorView';
import { useGetMovieDetailsQuery } from '@features/movies/api/moviesApi';
import { MovieDetailScreenProps } from '@navigation/types';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { getBackdropUrl, getPosterUrl } from '@shared/utils/imageHelpers';
import { formatFullDate, formatRuntime } from '@shared/utils/formatters';

export const MovieDetailScreen: React.FC<MovieDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const {
    movieId,
    title,
    initialPosterPath,
    initialBackdropPath,
    initialVoteAverage,
    initialReleaseDate,
  } = route.params;

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const {
    data: movieDetails,
    isLoading,
    isError,
    refetch,
  } = useGetMovieDetailsQuery(movieId);

  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);

  // Highest resolution available: details backdrop or route initial
  const backdropPath = movieDetails?.backdrop_path || initialBackdropPath;
  const backdropUri = getBackdropUrl(backdropPath, 'original');

  const posterPath = movieDetails?.poster_path || initialPosterPath;
  const posterUri = getPosterUrl(posterPath, 'w500');

  const voteAverage = movieDetails?.vote_average ?? initialVoteAverage;
  const releaseDate = movieDetails?.release_date ?? initialReleaseDate;
  const formattedDate = formatFullDate(releaseDate);
  const formattedRuntime = formatRuntime(movieDetails?.runtime);

  const handleBack = () => {
    navigation.goBack();
  };

  if (isError && !movieDetails) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.floatingHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <AppText variant="subtitle" color="text">
              ←
            </AppText>
          </TouchableOpacity>
        </View>
        <ErrorView
          title="Error al cargar detalles"
          message="No pudimos obtener la información completa de la película. Por favor, inténtalo de nuevo."
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Backdrop Hero with High-Resolution Image */}
        <View style={[styles.backdropContainer, { width, height: width * 0.7 }]}>
          {backdropUri ? (
            <>
              <Image
                source={{ uri: backdropUri }}
                style={styles.backdropImage}
                resizeMode="cover"
                onLoadEnd={() => setBackdropLoaded(true)}
              />
              {!backdropLoaded && (
                <View style={styles.backdropPlaceholder}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}
            </>
          ) : (
            <View style={styles.backdropPlaceholder}>
              <AppText variant="hero" color="textMuted">
                🎬
              </AppText>
            </View>
          )}

          {/* Dark gradient overlay simulation */}
          <View style={styles.backdropGradientBottom} />
          <View style={styles.backdropGradientTop} />
        </View>

        {/* Content Container */}
        <View style={styles.content}>
          {/* Main Info Header: Poster overlap + Title + Rating */}
          <View style={styles.headerInfoRow}>
            {/* High-Resolution Poster Card */}
            <View style={styles.posterWrapper}>
              {posterUri ? (
                <>
                  <Image
                    source={{ uri: posterUri }}
                    style={styles.posterImage}
                    resizeMode="cover"
                    onLoadEnd={() => setPosterLoaded(true)}
                  />
                  {!posterLoaded && (
                    <View style={styles.posterLoader}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.posterLoader}>
                  <AppText variant="subtitle" color="textMuted">
                    🎬
                  </AppText>
                </View>
              )}
            </View>

            {/* Title, Year, Rating */}
            <View style={styles.mainInfoText}>
              <AppText variant="title" color="text" style={styles.movieTitle}>
                {movieDetails?.title || title}
              </AppText>

              {movieDetails?.tagline && (
                <AppText
                  variant="caption"
                  color="textSecondary"
                  style={styles.tagline}
                  numberOfLines={2}
                >
                  "{movieDetails.tagline}"
                </AppText>
              )}

              <View style={styles.ratingRow}>
                <RatingBadge rating={voteAverage} size="medium" />
                {movieDetails?.vote_count ? (
                  <AppText
                    variant="caption"
                    color="textMuted"
                    style={styles.voteCount}
                  >
                    ({movieDetails.vote_count.toLocaleString()} votos)
                  </AppText>
                ) : null}
              </View>

              {formattedRuntime && (
                <View style={styles.runtimeRow}>
                  <AppText variant="caption" color="textSecondary">
                    ⏱ {formattedRuntime}
                  </AppText>
                </View>
              )}
            </View>
          </View>

          {/* Details Loading indicator if initial params are showing while details fetch */}
          {isLoading && !movieDetails && (
            <View style={styles.detailsLoadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText
                variant="caption"
                color="textMuted"
                style={styles.detailsLoadingText}
              >
                Cargando información adicional...
              </AppText>
            </View>
          )}

          {/* Release Date Info */}
          <View style={styles.section}>
            <AppText variant="captionBold" color="textMuted" style={styles.sectionLabel}>
              FECHA DE ESTRENO
            </AppText>
            <AppText variant="body" color="text">
              📅 {formattedDate}
            </AppText>
          </View>

          {/* Genres */}
          {movieDetails?.genres && movieDetails.genres.length > 0 && (
            <View style={styles.section}>
              <AppText variant="captionBold" color="textMuted" style={styles.sectionLabel}>
                GÉNEROS
              </AppText>
              <View style={styles.genresContainer}>
                {movieDetails.genres.map((genre) => (
                  <Badge
                    key={genre.id}
                    label={genre.name}
                    variant="surface"
                    style={styles.genreBadge}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Synopsis (Overview) */}
          <View style={styles.section}>
            <AppText variant="captionBold" color="textMuted" style={styles.sectionLabel}>
              SINOPSIS
            </AppText>
            <AppText variant="body" color="text" style={styles.overviewText}>
              {movieDetails?.overview ||
                'No hay sinopsis disponible para esta película en este momento.'}
            </AppText>
          </View>

          {/* Production Companies */}
          {movieDetails?.production_companies &&
            movieDetails.production_companies.length > 0 && (
              <View style={styles.section}>
                <AppText variant="captionBold" color="textMuted" style={styles.sectionLabel}>
                  COMPAÑÍAS DE PRODUCCIÓN
                </AppText>
                <View style={styles.genresContainer}>
                  {movieDetails.production_companies.map((company) => (
                    <Badge
                      key={company.id}
                      label={company.name}
                      variant="outline"
                      style={styles.genreBadge}
                    />
                  ))}
                </View>
              </View>
            )}
        </View>
      </ScrollView>

      {/* Floating Back Button */}
      <View style={[styles.floatingHeader, { top: insets.top + spacing.xs }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <AppText variant="subtitle" color="text" style={styles.backIcon}>
            ←
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  backdropContainer: {
    backgroundColor: colors.surfaceElevated,
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  backdropPlaceholder: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  backdropGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: colors.background,
    opacity: 0.95,
  },
  backdropGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'rgba(11, 14, 20, 0.4)',
  },
  floatingHeader: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(11, 14, 20, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  backIcon: {
    fontSize: 20,
    lineHeight: 22,
  },
  content: {
    marginTop: -spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  headerInfoRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  posterWrapper: {
    width: 120,
    aspectRatio: 2 / 3,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterLoader: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  mainInfoText: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xs,
  },
  movieTitle: {
    marginBottom: spacing.xs,
  },
  tagline: {
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  voteCount: {
    marginLeft: spacing.sm,
  },
  runtimeRow: {
    marginTop: spacing.xs,
  },
  detailsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  detailsLoadingText: {
    marginLeft: spacing.sm,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionLabel: {
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  overviewText: {
    lineHeight: 23,
    color: colors.text,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genreBadge: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
});

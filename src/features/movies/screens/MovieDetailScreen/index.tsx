import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@shared/components/ui/Text';
import { Badge } from '@shared/components/ui/Badge';
import { RatingBadge } from '@features/movies/components/RatingBadge';
import { FavoriteButton } from '@features/movies/components/FavoriteButton';
import { CastList } from '@features/movies/components/CastList';
import { ErrorView } from '@shared/components/feedback/ErrorView';
import { useGetMovieDetailsQuery } from '@features/movies/api/moviesApi';
import { MovieDTO } from '@features/movies/api/types';
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

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: movieDetails?.title || title,
        message: `¡Mira esta película: "${movieDetails?.title || title}"! Más info en TMDB: https://www.themoviedb.org/movie/${movieId}`,
      });
    } catch {
      // User cancelled or dismissed share sheet
    }
  }, [movieDetails?.title, title, movieId]);

  if (isError && !movieDetails) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.floatingHeaderLeft}>
          <TouchableOpacity
            style={styles.circleButton}
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

  const currentMovie: MovieDTO = {
    id: movieId,
    title: movieDetails?.title || title,
    original_title: movieDetails?.original_title || title,
    overview: movieDetails?.overview || '',
    poster_path: posterPath ?? null,
    backdrop_path: backdropPath ?? null,
    release_date: releaseDate || '',
    vote_average: voteAverage || 0,
    vote_count: movieDetails?.vote_count || 0,
    popularity: movieDetails?.popularity || 0,
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Backdrop Hero with High-Resolution Image */}
        <View style={[styles.backdropContainer, { width, height: width * 0.72 }]}>
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

            {/* Title, Tagline, Year, Rating */}
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

              {/* Specs Pills: HD, Language, Runtime */}
              <View style={styles.specsRow}>
                <Badge label="HD" variant="rating" style={styles.specBadge} />
                {movieDetails?.original_language && (
                  <Badge
                    label={movieDetails.original_language.toUpperCase()}
                    variant="surface"
                    style={styles.specBadge}
                  />
                )}
                {formattedRuntime && (
                  <Badge
                    label={formattedRuntime}
                    variant="outline"
                    style={styles.specBadge}
                  />
                )}
              </View>
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

          {/* Cast / Reparto */}
          <CastList movieId={movieId} />

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

      {/* Floating Top Navigation Header */}
      <View style={[styles.floatingHeaderContainer, { top: insets.top + spacing.xs }]}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <AppText variant="subtitle" color="text" style={styles.backIcon}>
            ←
          </AppText>
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          <FavoriteButton movie={currentMovie} size="medium" />

          <TouchableOpacity
            style={styles.circleButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <AppText variant="subtitle" color="text">
              ↗
            </AppText>
          </TouchableOpacity>
        </View>
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
    height: 100,
    backgroundColor: colors.background,
    opacity: 0.95,
  },
  backdropGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(11, 14, 20, 0.5)',
  },
  floatingHeaderContainer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  floatingHeaderLeft: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 10,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    width: 125,
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
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  specBadge: {
    paddingVertical: 2,
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

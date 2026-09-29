import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Share,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@shared/components/ui/Text';
import { PressableScale } from '@shared/components/ui/PressableScale';
import { Badge } from '@shared/components/ui/Badge';
import { AppImage } from '@shared/components/ui/AppImage';
import { ArrowLeftIcon, FilmIcon, ShareIcon } from '@shared/components/ui/Icon';
import { EdgeFade } from '@shared/components/ui/EdgeFade';
import { SectionLabel } from '@shared/components/ui/SectionLabel';
import { RatingBadge } from '@features/movies/components/RatingBadge';
import { FavoriteButton } from '@features/movies/components/FavoriteButton';
import { CastList } from '@features/movies/components/CastList';
import { ErrorView } from '@shared/components/feedback/ErrorView';
import { useGetMovieDetailsQuery } from '@features/movies/api/moviesApi';
import { MovieDTO } from '@features/movies/api/types';
import { MovieDetailScreenProps } from '@navigation/types';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { getBackdropUrl } from '@shared/utils/imageHelpers';
import { formatFullDate, formatRuntime } from '@shared/utils/formatters';
import { useTranslation } from '@shared/i18n';

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
  const { t, language } = useTranslation();

  const hasValidId = Boolean(movieId) && typeof movieId === 'number';

  const {
    data: movieDetails,
    isLoading,
    isError,
    refetch,
  } = useGetMovieDetailsQuery(movieId, { skip: !hasValidId });

  // Highest resolution available: details backdrop or route initial
  const backdropPath = movieDetails?.backdrop_path || initialBackdropPath;
  const backdropUri = getBackdropUrl(backdropPath, 'original');

  const posterPath = movieDetails?.poster_path || initialPosterPath;

  const voteAverage = movieDetails?.vote_average ?? initialVoteAverage;
  const releaseDate = movieDetails?.release_date ?? initialReleaseDate;
  const formattedDate = formatFullDate(
    releaseDate,
    language,
    t('common.noDate'),
  );
  const formattedRuntime = formatRuntime(movieDetails?.runtime);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: movieDetails?.title || title,
        message: t('detail.shareMessage', {
          title: movieDetails?.title || title,
          url: `https://www.themoviedb.org/movie/${movieId}`,
        }),
      });
    } catch {
      // User cancelled or dismissed share sheet
    }
  }, [movieDetails?.title, title, movieId, t]);

  if (!hasValidId) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ErrorView
          title={t('detail.errorTitle')}
          message={t('detail.errorMessage')}
          onRetry={handleBack}
        />
      </View>
    );
  }

  if (isError && !movieDetails) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View
          style={[styles.floatingHeaderLeft, { top: insets.top + spacing.xs }]}
        >
          <PressableScale
            style={styles.circleButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <ArrowLeftIcon size={20} color={colors.text} />
          </PressableScale>
        </View>
        <ErrorView
          title={t('detail.errorTitle')}
          message={t('detail.errorMessage')}
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.xxxl + insets.bottom },
        ]}
      >
        {/* Editorial hero: backdrop with the title overlaid */}
        <View style={[styles.hero, { width, height: width * 0.86 }]}>
          <AppImage
            uri={backdropUri}
            style={styles.backdropImage}
            resizeMode="cover"
            priority="high"
            fallback={
              <View style={styles.backdropPlaceholder}>
                <FilmIcon size={44} />
              </View>
            }
          />

          <EdgeFade edge="top" height={130} maxOpacity={0.6} />
          <EdgeFade edge="bottom" height={width * 0.64} maxOpacity={1} />

          <View style={styles.heroContent}>
            <AppText
              variant="hero"
              color="text"
              numberOfLines={2}
              style={styles.heroTitle}
            >
              {movieDetails?.title || title}
            </AppText>

            {movieDetails?.tagline ? (
              <AppText
                variant="caption"
                color="textSecondary"
                numberOfLines={2}
                style={styles.heroTagline}
              >
                "{movieDetails.tagline}"
              </AppText>
            ) : null}

            <View style={styles.heroMeta}>
              <RatingBadge rating={voteAverage} size="medium" />
              <AppText
                variant="caption"
                color="textSecondary"
                style={styles.heroMetaText}
              >
                {formattedRuntime
                  ? `${formattedDate} · ${formattedRuntime}`
                  : formattedDate}
              </AppText>
            </View>

            <View style={styles.heroSpecs}>
              <Badge label="HD" variant="rating" />
              {movieDetails?.original_language ? (
                <Badge
                  label={movieDetails.original_language.toUpperCase()}
                  variant="surface"
                />
              ) : null}
              {movieDetails?.vote_count ? (
                <Badge
                  label={t('detail.votes', {
                    count: movieDetails.vote_count.toLocaleString(language),
                  })}
                  variant="outline"
                />
              ) : null}
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isLoading && !movieDetails ? (
            <View style={styles.detailsLoadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText
                variant="caption"
                color="textMuted"
                style={styles.detailsLoadingText}
              >
                {t('detail.loadingExtra')}
              </AppText>
            </View>
          ) : null}

          {movieDetails?.genres && movieDetails.genres.length > 0 ? (
            <View style={styles.section}>
              <SectionLabel title={t('detail.genres')} />
              <View style={styles.genresContainer}>
                {movieDetails.genres.map(genre => (
                  <Badge
                    key={genre.id}
                    label={genre.name}
                    variant="surface"
                    style={styles.genreBadge}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionLabel title={t('detail.synopsis')} />
            <AppText variant="body" color="text" style={styles.overviewText}>
              {movieDetails?.overview || t('detail.synopsisEmpty')}
            </AppText>
          </View>

          <CastList movieId={movieId} />

          {movieDetails?.production_companies &&
          movieDetails.production_companies.length > 0 ? (
            <View style={styles.section}>
              <SectionLabel title={t('detail.productionCompanies')} />
              <View style={styles.genresContainer}>
                {movieDetails.production_companies.map(company => (
                  <Badge
                    key={company.id}
                    label={company.name}
                    variant="outline"
                    style={styles.genreBadge}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Floating Top Navigation Header */}
      <View
        style={[
          styles.floatingHeaderContainer,
          { top: insets.top + spacing.xs },
        ]}
      >
        <PressableScale
          style={styles.circleButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <ArrowLeftIcon size={20} color={colors.text} />
        </PressableScale>

        <View style={styles.headerRightActions}>
          <FavoriteButton movie={currentMovie} size="medium" />

          <PressableScale
            style={styles.circleButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel={t('detail.shareAction')}
          >
            <ShareIcon size={20} color={colors.text} />
          </PressableScale>
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
  hero: {
    position: 'relative',
    backgroundColor: colors.surfaceElevated,
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
  heroContent: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
  },
  heroTagline: {
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  heroMetaText: {
    marginLeft: spacing.sm,
    flexShrink: 1,
  },
  heroSpecs: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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

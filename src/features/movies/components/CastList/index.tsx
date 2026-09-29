import React from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { AppImage } from '@shared/components/ui/AppImage';
import { SectionLabel } from '@shared/components/ui/SectionLabel';
import { useGetMovieCreditsQuery } from '@features/movies/api/moviesApi';
import { useTranslation } from '@shared/i18n';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { getPosterUrl } from '@shared/utils/imageHelpers';

export interface CastListProps {
  movieId: number;
}

export const CastList: React.FC<CastListProps> = ({ movieId }) => {
  const { data: credits, isLoading } = useGetMovieCreditsQuery(movieId);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  const topCast = (credits?.cast || []).slice(0, 8);

  if (topCast.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SectionLabel title={t('detail.castTitle')} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {topCast.map(actor => {
          const profileUri = getPosterUrl(actor.profile_path, 'w185');
          const actorName = actor.name?.trim() || t('detail.unknown');
          const initial = actorName.charAt(0).toUpperCase() || '?';

          return (
            <View key={actor.id} style={styles.actorCard}>
              <View style={styles.avatarContainer}>
                <AppImage
                  uri={profileUri}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  fallback={
                    <View style={styles.avatarPlaceholder}>
                      <AppText variant="captionBold" color="textMuted">
                        {initial}
                      </AppText>
                    </View>
                  }
                />
              </View>

              <AppText
                variant="tag"
                color="text"
                numberOfLines={2}
                align="center"
                style={styles.actorName}
              >
                {actorName}
              </AppText>

              {actor.character ? (
                <AppText
                  variant="tag"
                  color="textMuted"
                  numberOfLines={1}
                  align="center"
                  style={styles.characterName}
                >
                  {actor.character}
                </AppText>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  loadingContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  scrollList: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  actorCard: {
    width: 76,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.borderLight,
    marginBottom: spacing.xs,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighlight,
  },
  actorName: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
  characterName: {
    fontSize: 10,
    lineHeight: 13,
    marginTop: 1,
  },
});

import React from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { AppText } from '@shared/components/ui/Text';
import { useGetMovieCreditsQuery } from '@features/movies/api/moviesApi';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { getPosterUrl } from '@shared/utils/imageHelpers';

export interface CastListProps {
  movieId: number;
}

export const CastList: React.FC<CastListProps> = ({ movieId }) => {
  const { data: credits, isLoading } = useGetMovieCreditsQuery(movieId);

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
      <AppText variant="captionBold" color="textMuted" style={styles.sectionLabel}>
        REPARTO PRINCIPAL
      </AppText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {topCast.map((actor) => {
          const profileUri = getPosterUrl(actor.profile_path, 'w185');

          return (
            <View key={actor.id} style={styles.actorCard}>
              <View style={styles.avatarContainer}>
                {profileUri ? (
                  <Image
                    source={{ uri: profileUri }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <AppText variant="captionBold" color="textMuted">
                      {actor.name.charAt(0)}
                    </AppText>
                  </View>
                )}
              </View>

              <AppText
                variant="tag"
                color="text"
                numberOfLines={2}
                align="center"
                style={styles.actorName}
              >
                {actor.name}
              </AppText>

              <AppText
                variant="tag"
                color="textMuted"
                numberOfLines={1}
                align="center"
                style={styles.characterName}
              >
                {actor.character}
              </AppText>
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
  sectionLabel: {
    letterSpacing: 1,
    marginBottom: spacing.sm,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
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

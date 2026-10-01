import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ListRenderItem,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '@app/store/hooks';
import { selectAllFavorites } from '@features/movies/store/favoritesSlice';
import { MovieCard } from '@features/movies/components/MovieCard';
import { useNavigateToMovie } from '@features/movies/hooks/useNavigateToMovie';
import { EmptyStateView } from '@shared/components/feedback/EmptyStateView';
import { AppText } from '@shared/components/ui/Text';
import { PressableScale } from '@shared/components/ui/PressableScale';
import { ArrowLeftIcon } from '@shared/components/ui/Icon';
import { useTranslation } from '@shared/i18n';
import { MovieDTO } from '@features/movies/api/types';
import { FavoritesScreenProps } from '@navigation/types';
import { ROUTES } from '@navigation/routes';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t, language } = useTranslation();
  const favorites = useAppSelector(selectAllFavorites);

  const horizontalPadding = spacing.lg * 2;
  const columnGap = spacing.lg;
  const itemWidth = (width - horizontalPadding - columnGap) / 2;

  const handleMoviePress = useNavigateToMovie(navigation);

  const totalRows = Math.ceil(favorites.length / 2);

  const renderItem: ListRenderItem<MovieDTO> = useCallback(
    ({ item, index }) => {
      const isLastRow = Math.floor(index / 2) === totalRows - 1;
      return (
        <View
          style={[
            styles.gridItem,
            { width: itemWidth },
            isLastRow && styles.gridItemLast,
          ]}
        >
          <MovieCard
            movie={item}
            width={itemWidth}
            onPress={handleMoviePress}
          />
        </View>
      );
    },
    [itemWidth, totalRows, handleMoviePress],
  );

  const keyExtractor = useCallback((item: MovieDTO) => String(item.id), []);

  const goToCatalog = useCallback(() => {
    navigation.navigate(ROUTES.MOVIE_LIST);
  }, [navigation]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <PressableScale
            style={styles.circleButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <ArrowLeftIcon size={20} color={colors.text} />
          </PressableScale>
        </View>

        <AppText variant="title" color="text">
          {t('favorites.title')}
        </AppText>

        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={favorites}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: spacing.xxl + insets.bottom },
        ]}
        ListHeaderComponent={
          favorites.length > 0 ? (
            <AppText variant="caption" color="textMuted" style={styles.count}>
              {favorites.length === 1
                ? t('favorites.countOne')
                : t('favorites.count', {
                    count: favorites.length.toLocaleString(language),
                  })}
            </AppText>
          ) : undefined
        }
        ListEmptyComponent={
          <EmptyStateView
            title={t('favorites.emptyTitle')}
            message={t('favorites.emptyMessage')}
            onAction={goToCatalog}
            actionTitle={t('favorites.emptyAction')}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerRight: {
    flex: 1,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingTop: spacing.xs,
    flexGrow: 1,
  },
  count: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  gridItem: {
    marginBottom: spacing.md,
  },
  gridItemLast: {
    marginBottom: 0,
  },
});

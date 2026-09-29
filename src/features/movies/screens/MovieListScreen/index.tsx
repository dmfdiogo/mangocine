import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Animated,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  ListRenderItem,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@shared/components/ui/Text';
import { PressableScale } from '@shared/components/ui/PressableScale';
import { MangoIcon } from '@shared/components/ui/Icon';
import { BrandWordmark } from '@shared/components/ui/BrandWordmark';
import { SearchBar } from '@features/search';
import {
  MovieCard,
  MOVIE_CARD_BORDER_WIDTH,
} from '@features/movies/components/MovieCard';
import { MovieCardSkeleton } from '@features/movies/components/MovieCardSkeleton';
import { CategoryFilterTabs } from '@features/movies/components/CategoryFilterTabs';
import { HeaderMenuButton } from '@shared/components/ui/HeaderMenuButton';
import { ErrorView } from '@shared/components/feedback/ErrorView';
import { EmptyStateView } from '@shared/components/feedback/EmptyStateView';
import { preloadImages } from '@shared/components/ui/AppImage';
import { useMoviesFlow } from '@features/movies/hooks/useMoviesFlow';
import { getCatalogItemLayout } from '@features/movies/utils/catalogLayout';
import { MovieDTO } from '@features/movies/api/types';
import { MovieListScreenProps } from '@navigation/types';
import { ROUTES } from '@navigation/routes';
import { useTranslation } from '@shared/i18n';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { elevation } from '@shared/theme/elevation';
import { getPosterUrl } from '@shared/utils/imageHelpers';

const SKELETON_ARRAY = [1, 2, 3, 4, 5, 6];
const NUM_COLUMNS = 2;
const ROW_GAP = spacing.md;
const PRELOAD_WINDOW = 40; // preload the last ~2 pages of posters

export const MovieListScreen: React.FC<MovieListScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t, language } = useTranslation();

  // Clean Flow Hook (ViewModel pattern)
  const {
    movies,
    totalResults,
    selectedCategory,
    searchQuery,
    debouncedQuery,
    isSearchMode,
    isDebouncing,
    isSearchTooShort,
    isLoading,
    isFetching,
    isError,
    isPaginationError,
    isLimitReached,
    isRefreshing,
    onCategoryChange,
    onSearchChange,
    onClearSearch,
    onEndReached,
    onRefresh,
    onRetry,
    onRetryPagination,
    onMoviePrefetch,
  } = useMoviesFlow();

  // Grid layout: deterministic so getItemLayout is exact.
  const horizontalPadding = spacing.lg * 2;
  const columnGap = spacing.lg;
  const itemWidth = (width - horizontalPadding - columnGap) / NUM_COLUMNS;
  const contentWidth = itemWidth - MOVIE_CARD_BORDER_WIDTH * 2;
  const posterHeight = (contentWidth * 3) / 2;
  const cardHeight = posterHeight + MOVIE_CARD_BORDER_WIDTH * 2;
  const rowHeight = cardHeight + ROW_GAP;

  const [isScrolled, setIsScrolled] = useState(false);
  const listRef = useRef<FlatList<MovieDTO>>(null);
  const preloadedRef = useRef<Set<string>>(new Set());
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const hasFadedRef = useRef(false);

  // Fade the grid in once, when the first page of content is ready.
  useEffect(() => {
    if (!isLoading && !isError && !hasFadedRef.current) {
      hasFadedRef.current = true;
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, isError, contentOpacity]);

  // Header gains a hairline + shadow once the list is scrolled (hysteresis
  // avoids flipping on tiny jitter). No layout changes here, so no feedback.
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      if (!isScrolled && y > 12) setIsScrolled(true);
      else if (isScrolled && y < 4) setIsScrolled(false);
    },
    [isScrolled],
  );

  // Return to the top when the dataset identity changes (category / search mode)
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    preloadedRef.current.clear();
  }, [selectedCategory, isSearchMode]);

  // Preload upcoming posters into the FastImage cache to avoid decode spikes.
  // Only new uris are preloaded (each merge re-runs this effect).
  useEffect(() => {
    if (movies.length === 0) return;
    const toPreload: string[] = [];
    movies.slice(-PRELOAD_WINDOW).forEach(movie => {
      const uri = getPosterUrl(movie.poster_path, 'w342');
      if (uri && !preloadedRef.current.has(uri)) {
        preloadedRef.current.add(uri);
        toPreload.push(uri);
      }
    });
    if (toPreload.length > 0) {
      preloadImages(toPreload);
    }
  }, [movies]);

  const goToFavorites = useCallback(() => {
    navigation.navigate(ROUTES.FAVORITES);
  }, [navigation]);

  // Ref to prevent double-click / rapid re-entrance navigation
  const lastNavigationTime = useRef<number>(0);

  const handleMoviePress = useCallback(
    (movie: MovieDTO) => {
      const now = Date.now();
      if (now - lastNavigationTime.current < 600) {
        return;
      }
      lastNavigationTime.current = now;

      navigation.navigate(ROUTES.MOVIE_DETAIL, {
        movieId: movie.id,
        title: movie.title,
        initialPosterPath: movie.poster_path,
        initialBackdropPath: movie.backdrop_path,
        initialVoteAverage: movie.vote_average,
        initialReleaseDate: movie.release_date,
      });
    },
    [navigation],
  );

  // The row gap lives inside the item height. Drop it on the last row so the
  // footer (loader / end message) isn't preceded by a stray gap.
  const totalRows = Math.ceil(movies.length / NUM_COLUMNS);

  const renderItem: ListRenderItem<MovieDTO> = useCallback(
    ({ item, index }) => {
      const isLastRow = Math.floor(index / NUM_COLUMNS) === totalRows - 1;
      return (
        <View
          style={{
            width: itemWidth,
            height: isLastRow ? cardHeight : rowHeight,
          }}
        >
          <MovieCard
            movie={item}
            width={itemWidth}
            onPress={handleMoviePress}
            onPressIn={onMoviePrefetch}
          />
        </View>
      );
    },
    [
      itemWidth,
      cardHeight,
      rowHeight,
      totalRows,
      handleMoviePress,
      onMoviePrefetch,
    ],
  );

  const keyExtractor = useCallback((item: MovieDTO) => String(item.id), []);

  // NOTE: with numColumns, `index` is already the ROW index (see catalogLayout).
  const getItemLayout = useMemo(
    () => getCatalogItemLayout(rowHeight),
    [rowHeight],
  );

  // Pinned header (outside the FlatList) so getItemLayout stays exact.
  // Search + category chips stay visible — the market standard for catalogs.
  const header = (
    <View style={[styles.headerContainer, isScrolled && styles.headerScrolled]}>
      <View style={styles.titleRow}>
        <HeaderMenuButton onNavigateFavorites={goToFavorites} />
        <View style={styles.brandLockup}>
          <MangoIcon size={26} />
          <BrandWordmark variant="hero" style={styles.brandTitle} />
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        onClear={onClearSearch}
        placeholder={t('search.placeholder')}
        loading={isDebouncing || (isSearchMode && isFetching)}
        style={styles.searchBar}
      />

      {isSearchTooShort && (
        <AppText variant="caption" color="textMuted" style={styles.searchHint}>
          {t('search.tooShort')}
        </AppText>
      )}

      {!isSearchMode && (
        <CategoryFilterTabs
          selectedCategory={selectedCategory}
          onSelectCategory={onCategoryChange}
          style={styles.categoryTabs}
        />
      )}

      {isSearchMode && (
        <View style={styles.resultsRow}>
          <AppText
            variant="captionBold"
            color="textSecondary"
            numberOfLines={1}
            style={styles.resultsText}
          >
            {t('list.resultsFor', { query: debouncedQuery })}
          </AppText>
          {totalResults > 0 && (
            <AppText
              variant="tag"
              color="textMuted"
              style={styles.sectionCount}
            >
              {t('list.titles', {
                count: totalResults.toLocaleString(language),
              })}
            </AppText>
          )}
        </View>
      )}
    </View>
  );

  // Resilient footer loader & error handler
  const renderListFooter = useMemo(() => {
    if (isPaginationError) {
      return (
        <View style={styles.footerErrorContainer}>
          <AppText
            variant="caption"
            color="error"
            style={styles.footerErrorText}
          >
            {t('list.footerError')}
          </AppText>
          <PressableScale
            onPress={onRetryPagination}
            style={styles.footerRetryButton}
          >
            <AppText variant="tag" color="onPrimary">
              {t('common.retry')}
            </AppText>
          </PressableScale>
        </View>
      );
    }

    if (isFetching && !isLoading) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText
            variant="caption"
            color="textMuted"
            style={styles.footerText}
          >
            {t('list.loadingMore')}
          </AppText>
        </View>
      );
    }

    if (isLimitReached) {
      return (
        <View style={styles.footerLoader}>
          <AppText variant="caption" color="textMuted" align="center">
            {t('list.limitReached')}
          </AppText>
        </View>
      );
    }

    return undefined;
  }, [
    isPaginationError,
    onRetryPagination,
    isFetching,
    isLoading,
    isLimitReached,
    t,
  ]);

  // Initial loading state (Skeleton Grid)
  if (isLoading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header}
        <View style={styles.skeletonGrid}>
          {SKELETON_ARRAY.map(key => (
            <View key={key} style={{ width: itemWidth, height: rowHeight }}>
              <MovieCardSkeleton width={itemWidth} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Initial Error state
  if (isError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header}
        <ErrorView
          title={t('list.errorTitle')}
          message={t('list.errorMessage')}
          onRetry={onRetry}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {header}
      <Animated.View style={[styles.listWrap, { opacity: contentOpacity }]}>
        <FlatList
          ref={listRef}
          data={movies}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: spacing.xxl + insets.bottom },
          ]}
          getItemLayout={getItemLayout}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={
            !isFetching ? (
              <EmptyStateView
                title={
                  isSearchMode
                    ? t('list.emptySearchTitle')
                    : t('list.emptyTitle')
                }
                message={
                  isSearchMode
                    ? t('list.emptySearchMessage', { query: debouncedQuery })
                    : t('list.emptyMessage')
                }
                onAction={isSearchMode ? onClearSearch : onRetry}
                actionTitle={
                  isSearchMode ? t('list.clearSearch') : t('list.reload')
                }
              />
            ) : undefined
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={1}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          // Don't let iOS auto-adjust the offset when the header changes height
          // (that adjustment is what caused the collapse/expand feedback loop).
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          // `removeClippedSubviews` is a memory win on Android but is known to
          // cause blank cells on iOS, so it is scoped per-platform.
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          initialNumToRender={6}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listWrap: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  headerScrolled: {
    borderBottomColor: colors.border,
    ...elevation.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandTitle: {
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  searchBar: {
    marginBottom: spacing.md,
  },
  searchHint: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  categoryTabs: {
    paddingHorizontal: 0,
    marginBottom: spacing.sm,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  resultsText: {
    flexShrink: 1,
    marginRight: spacing.sm,
    letterSpacing: 0.5,
  },
  sectionCount: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
    fontVariant: ['tabular-nums'],
  },
  listContent: {
    // Keep vertical padding out of the content container so `getItemLayout`
    // offsets stay exact (row * rowHeight).
    paddingTop: 0,
    // Let the empty state (flex:1) fill the viewport instead of collapsing.
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  footerLoader: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginTop: spacing.xs,
  },
  footerErrorContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  footerErrorText: {
    marginBottom: spacing.xs,
  },
  footerRetryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
});

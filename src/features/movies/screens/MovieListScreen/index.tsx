import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@shared/components/ui/Text';
import { SearchBar } from '@features/search';
import { MovieCard } from '@features/movies/components/MovieCard';
import { MovieCardSkeleton } from '@features/movies/components/MovieCardSkeleton';
import { CategoryFilterTabs } from '@features/movies/components/CategoryFilterTabs';
import { ErrorView } from '@shared/components/feedback/ErrorView';
import { EmptyStateView } from '@shared/components/feedback/EmptyStateView';
import { useMoviesFlow } from '@features/movies/hooks/useMoviesFlow';
import { MovieDTO } from '@features/movies/api/types';
import { MovieListScreenProps } from '@navigation/types';
import { ROUTES } from '@navigation/routes';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

const SKELETON_ARRAY = [1, 2, 3, 4, 5, 6];

export const MovieListScreen: React.FC<MovieListScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Clean Flow Hook (ViewModel pattern)
  const {
    movies,
    totalResults,
    selectedCategory,
    searchQuery,
    debouncedQuery,
    isSearchMode,
    isDebouncing,
    isLoading,
    isFetching,
    isError,
    isPaginationError,
    isRefreshing,
    currentCategoryLabel,
    onCategoryChange,
    onSearchChange,
    onClearSearch,
    onEndReached,
    onRefresh,
    onRetry,
    onRetryPagination,
    onMoviePrefetch,
  } = useMoviesFlow();

  // Grid layout calculation
  const horizontalPadding = spacing.md * 2;
  const columnGap = spacing.md;
  const itemWidth = (width - horizontalPadding - columnGap) / 2;

  // Navigate to details
  const handleMoviePress = useCallback(
    (movie: MovieDTO) => {
      navigation.navigate(ROUTES.MOVIE_DETAIL, {
        movieId: movie.id,
        title: movie.title,
        initialPosterPath: movie.poster_path,
        initialBackdropPath: movie.backdrop_path,
        initialVoteAverage: movie.vote_average,
        initialReleaseDate: movie.release_date,
      });
    },
    [navigation]
  );

  // Render movie card item with optimistic prefetching
  const renderItem: ListRenderItem<MovieDTO> = useCallback(
    ({ item }) => (
      <MovieCard
        movie={item}
        width={itemWidth}
        onPress={handleMoviePress}
        onPressIn={onMoviePrefetch}
      />
    ),
    [itemWidth, handleMoviePress, onMoviePrefetch]
  );

  // Key extractor
  const keyExtractor = useCallback((item: MovieDTO) => String(item.id), []);

  // List header with branding, search bar with loader, and category tabs
  const renderListHeader = useMemo(() => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <AppText variant="hero" color="text">
            CineExplora
          </AppText>
          <View style={styles.badgeTMDB}>
            <AppText variant="tag" color="primary">
              TMDB
            </AppText>
          </View>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={onSearchChange}
          onClear={onClearSearch}
          placeholder="Buscar películas por título..."
          loading={isDebouncing || (isSearchMode && isFetching)}
          style={styles.searchBar}
        />

        {!isSearchMode && (
          <CategoryFilterTabs
            selectedCategory={selectedCategory}
            onSelectCategory={onCategoryChange}
            style={styles.categoryTabs}
          />
        )}

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle" color="text">
            {isSearchMode
              ? `Resultados para "${debouncedQuery}"`
              : currentCategoryLabel}
          </AppText>
          {totalResults > 0 && (
            <AppText variant="caption" color="textMuted">
              {totalResults.toLocaleString()} títulos
            </AppText>
          )}
        </View>
      </View>
    );
  }, [
    searchQuery,
    onSearchChange,
    onClearSearch,
    isDebouncing,
    isSearchMode,
    isFetching,
    selectedCategory,
    onCategoryChange,
    debouncedQuery,
    currentCategoryLabel,
    totalResults,
  ]);

  // Resilient footer loader & error handler
  const renderListFooter = useMemo(() => {
    // Pagination error state (keeps existing movies visible!)
    if (isPaginationError) {
      return (
        <View style={styles.footerErrorContainer}>
          <AppText variant="caption" color="error" style={styles.footerErrorText}>
            No se pudieron cargar más películas.
          </AppText>
          <TouchableOpacity
            onPress={onRetryPagination}
            activeOpacity={0.7}
            style={styles.footerRetryButton}
          >
            <AppText variant="tag" color="text">
              Reintentar
            </AppText>
          </TouchableOpacity>
        </View>
      );
    }

    // Pagination loading spinner
    if (isFetching && !isLoading) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="caption" color="textMuted" style={styles.footerText}>
            Cargando más películas...
          </AppText>
        </View>
      );
    }

    return undefined;
  }, [isPaginationError, onRetryPagination, isFetching, isLoading]);

  // Initial loading state (Skeleton Grid)
  if (isLoading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.headerContainer}>
          <View style={styles.titleRow}>
            <AppText variant="hero" color="text">
              CineExplora
            </AppText>
          </View>
          <SearchBar
            value={searchQuery}
            onChangeText={onSearchChange}
            style={styles.searchBar}
          />
        </View>
        <View style={styles.skeletonGrid}>
          {SKELETON_ARRAY.map((key) => (
            <MovieCardSkeleton key={key} width={itemWidth} />
          ))}
        </View>
      </View>
    );
  }

  // Initial Error state
  if (isError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.headerContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={onSearchChange}
            style={styles.searchBar}
          />
        </View>
        <ErrorView
          title="Error al cargar películas"
          message="No se pudo conectar con el servicio de TMDB. Por favor, revisa tu conexión e inténtalo nuevamente."
          onRetry={onRetry}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={movies}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={
          !isFetching ? (
            <EmptyStateView
              title={isSearchMode ? 'Sin resultados' : 'Lista vacía'}
              message={
                isSearchMode
                  ? `No encontramos películas con el término "${debouncedQuery}". Intenta con otro nombre.`
                  : 'No hay películas disponibles en este momento.'
              }
              onAction={isSearchMode ? onClearSearch : onRetry}
              actionTitle={isSearchMode ? 'Limpiar búsqueda' : 'Recargar'}
            />
          ) : undefined
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badgeTMDB: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.4)',
  },
  searchBar: {
    marginBottom: spacing.md,
  },
  categoryTabs: {
    paddingHorizontal: 0,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
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

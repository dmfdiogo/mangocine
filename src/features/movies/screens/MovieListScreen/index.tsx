import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@shared/components/ui/Text';
import { SearchBar, useDebounce } from '@features/search';
import { MovieCard } from '@features/movies/components/MovieCard';
import { MovieCardSkeleton } from '@features/movies/components/MovieCardSkeleton';
import {
  CategoryFilterTabs,
  CATEGORIES,
} from '@features/movies/components/CategoryFilterTabs';
import { ErrorView } from '@shared/components/feedback/ErrorView';
import { EmptyStateView } from '@shared/components/feedback/EmptyStateView';
import {
  useGetMoviesByCategoryQuery,
  useSearchMoviesQuery,
} from '@features/movies/api/moviesApi';
import { MovieDTO, MovieCategory } from '@features/movies/api/types';
import { MovieListScreenProps } from '@navigation/types';
import { ROUTES } from '@navigation/routes';
import { colors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

const SKELETON_ARRAY = [1, 2, 3, 4, 5, 6];

export const MovieListScreen: React.FC<MovieListScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Search input and debounce state
  const [searchInput, setSearchInput] = useState('');
  const debouncedQuery = useDebounce(searchInput.trim(), 400);

  // Category and pagination states
  const [selectedCategory, setSelectedCategory] = useState<MovieCategory>('popular');
  const [categoryPage, setCategoryPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isSearchMode = debouncedQuery.length >= 2;

  // Category movies query (popular, top_rated, now_playing, upcoming)
  const categoryQueryResult = useGetMoviesByCategoryQuery(
    { category: selectedCategory, page: categoryPage },
    { skip: isSearchMode }
  );

  // Search movies query
  const searchQueryResult = useSearchMoviesQuery(
    { query: debouncedQuery, page: searchPage },
    { skip: !isSearchMode }
  );

  const activeQuery = isSearchMode ? searchQueryResult : categoryQueryResult;
  const { data, isLoading, isFetching, isError, refetch } = activeQuery;

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

  // Category change handler
  const handleCategoryChange = useCallback((category: MovieCategory) => {
    setSelectedCategory(category);
    setCategoryPage(1);
  }, []);

  // Pagination trigger (Infinite Scroll)
  const handleEndReached = useCallback(() => {
    if (isFetching || isLoading) return;

    if (data && data.page < data.total_pages) {
      if (isSearchMode) {
        setSearchPage((prev) => prev + 1);
      } else {
        setCategoryPage((prev) => prev + 1);
      }
    }
  }, [data, isFetching, isLoading, isSearchMode]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (isSearchMode) {
      setSearchPage(1);
    } else {
      setCategoryPage(1);
    }
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [isSearchMode, refetch]);

  // Render movie card item
  const renderItem: ListRenderItem<MovieDTO> = useCallback(
    ({ item }) => (
      <MovieCard
        movie={item}
        width={itemWidth}
        onPress={handleMoviePress}
      />
    ),
    [itemWidth, handleMoviePress]
  );

  // Key extractor
  const keyExtractor = useCallback((item: MovieDTO) => String(item.id), []);

  const currentCategoryLabel = useMemo(() => {
    const found = CATEGORIES.find((c) => c.id === selectedCategory);
    return found ? `${found.icon} ${found.label}` : 'Películas';
  }, [selectedCategory]);

  // List header with branding, search bar, and category tabs
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
          value={searchInput}
          onChangeText={(text) => {
            setSearchInput(text);
            if (text.trim().length >= 2) {
              setSearchPage(1);
            }
          }}
          onClear={() => {
            setSearchInput('');
            setSearchPage(1);
          }}
          placeholder="Buscar películas por título..."
          style={styles.searchBar}
        />

        {!isSearchMode && (
          <CategoryFilterTabs
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
            style={styles.categoryTabs}
          />
        )}

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle" color="text">
            {isSearchMode
              ? `Resultados para "${debouncedQuery}"`
              : currentCategoryLabel}
          </AppText>
          {data && (
            <AppText variant="caption" color="textMuted">
              {data.total_results.toLocaleString()} títulos
            </AppText>
          )}
        </View>
      </View>
    );
  }, [
    searchInput,
    isSearchMode,
    selectedCategory,
    handleCategoryChange,
    debouncedQuery,
    currentCategoryLabel,
    data,
  ]);

  // List footer loader for infinite scroll
  const renderListFooter = useMemo(() => {
    if (!isFetching || isLoading) return undefined;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText variant="caption" color="textMuted" style={styles.footerText}>
          Cargando más películas...
        </AppText>
      </View>
    );
  }, [isFetching, isLoading]);

  // Initial loading state (Skeleton Grid)
  if (isLoading && !data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.headerContainer}>
          <View style={styles.titleRow}>
            <AppText variant="hero" color="text">
              CineExplora
            </AppText>
          </View>
          <SearchBar
            value={searchInput}
            onChangeText={setSearchInput}
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

  // Error state (Initial load failed)
  if (isError && (!data || data.results.length === 0)) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.headerContainer}>
          <SearchBar
            value={searchInput}
            onChangeText={setSearchInput}
            style={styles.searchBar}
          />
        </View>
        <ErrorView
          title="Error al cargar películas"
          message="No se pudo conectar con el servicio de TMDB. Por favor, revisa tu conexión e inténtalo nuevamente."
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={data?.results || []}
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
              onAction={isSearchMode ? () => setSearchInput('') : refetch}
              actionTitle={isSearchMode ? 'Limpiar búsqueda' : 'Recargar'}
            />
          ) : undefined
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
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
});

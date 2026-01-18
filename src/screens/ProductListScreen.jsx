import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Animated,
  StatusBar,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchProducts,
  fetchCategories,
  loadCachedProducts,
  loadCachedCategories,
  setSearchQuery,
  setSelectedCategory,
  loadMoreProducts,
  setRefreshing,
  setOffline,
  clearError,
} from '../store/slices/productsSlice';
import { loadFavorites } from '../store/slices/favoritesSlice';
import { ITEMS_PER_PAGE } from '../constants';
import {
  ProductCard,
  SearchBar,
  CategoryFilter,
  ProductGridShimmer,
  ErrorView,
  OfflineBanner,
  LoadingFooter,
  EmptyState,
} from '../components';

export const ProductListScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const {
    filteredItems,
    categories,
    loading,
    error,
    page,
    hasMore,
    isRefreshing,
    searchQuery,
    selectedCategory,
    isOffline,
  } = useAppSelector((state) => state.products);

  const { items: favorites } = useAppSelector((state) => state.favorites);

  const headerAnim = useRef(new Animated.Value(0)).current;

  // Get paginated items
  const displayItems = useMemo(() => {
    return filteredItems.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredItems, page]);

  // Check if product is favorite
  const isFavorite = useCallback(
    (productId) => {
      return favorites.some((fav) => fav.id === productId);
    },
    [favorites],
  );

  // Track if we've fetched data after reconnect
  const hasFetchedRef = useRef(false);

  // Initial data load
  useEffect(() => {
    const initializeData = async () => {
      // Load cached data first for instant display
      await Promise.all([
        dispatch(loadCachedProducts()),
        dispatch(loadCachedCategories()),
        dispatch(loadFavorites()),
      ]);

      // Check network status
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        dispatch(fetchProducts());
        dispatch(fetchCategories());
        hasFetchedRef.current = true;
      } else {
        dispatch(setOffline(true));
      }
    };

    initializeData();

    // Network listener
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? false;
      dispatch(setOffline(!isConnected));
      if (isConnected && !hasFetchedRef.current) {
        dispatch(fetchProducts());
        dispatch(fetchCategories());
        hasFetchedRef.current = true;
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Header animation based on scroll
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: headerAnim } } }],
    { useNativeDriver: false },
  );

  const headerOpacity = headerAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    dispatch(setRefreshing(true));
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      await Promise.all([
        dispatch(fetchProducts()),
        dispatch(fetchCategories()),
      ]);
    } else {
      dispatch(setRefreshing(false));
    }
  }, [dispatch]);

  // Load more products
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && displayItems.length < filteredItems.length) {
      dispatch(loadMoreProducts());
    }
  }, [dispatch, loading, hasMore, displayItems.length, filteredItems.length]);

  // Search handler
  const handleSearch = useCallback(
    (text) => {
      dispatch(setSearchQuery(text));
    },
    [dispatch],
  );

  // Category filter handler
  const handleCategorySelect = useCallback(
    (category) => {
      dispatch(setSelectedCategory(category));
    },
    [dispatch],
  );

  // Navigate to product details
  const handleProductPress = useCallback(
    (productId) => {
      navigation.navigate('ProductDetails', { productId });
    },
    [navigation],
  );

  // Retry handler
  const handleRetry = useCallback(() => {
    dispatch(clearError());
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Render product item
  const renderItem = useCallback(
    ({ item, index }) => (
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item.id)}
        index={index}
        isFavorite={isFavorite(item.id)}
      />
    ),
    [handleProductPress, isFavorite],
  );

  // Key extractor
  const keyExtractor = useCallback(
    (item) => item.id.toString(),
    [],
  );

  // List header component
  const ListHeader = useCallback(
    () => (
      <Animated.View style={{ opacity: headerOpacity }}>
        <View style={styles.header}>
          <Animated.Text style={styles.title}>🛍️ Shop</Animated.Text>
        </View>
        <SearchBar value={searchQuery} onChangeText={handleSearch} />
        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        )}
      </Animated.View>
    ),
    [
      headerOpacity,
      searchQuery,
      handleSearch,
      categories,
      selectedCategory,
      handleCategorySelect,
    ],
  );

  // Empty component
  const ListEmpty = useCallback(() => {
    if (loading) return <ProductGridShimmer />;
    if (error) {
      return <ErrorView message={error} onRetry={handleRetry} />;
    }
    if (searchQuery || selectedCategory) {
      return (
        <EmptyState
          title="No Products Found"
          message="Try adjusting your search or filters"
          icon="🔍"
        />
      );
    }
    return null;
  }, [loading, error, searchQuery, selectedCategory, handleRetry]);

  // Footer component
  const ListFooter = useCallback(() => {
    if (displayItems.length === 0) return null;
    const isLoadingMore =
      displayItems.length < filteredItems.length && hasMore;
    return <LoadingFooter loading={isLoadingMore} />;
  }, [displayItems.length, filteredItems.length, hasMore]);

  // Optimization props for FlatList
  const getItemLayout = useCallback(
    (_data, index) => ({
      length: 250,
      offset: 250 * Math.floor(index / 2),
      index,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F9FA"
      />
      <OfflineBanner visible={isOffline} />
      <FlatList
        data={displayItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        windowSize={7}
        initialNumToRender={6}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    paddingBottom: 32,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A2E',
  },
});
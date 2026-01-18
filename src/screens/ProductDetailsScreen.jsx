import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addFavorite, removeFavorite } from '../store/slices/favoritesSlice';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { ProductDetailShimmer, ErrorView } from '../components';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4;

export const ProductDetailsScreen = ({ navigation, route }) => {
  const { productId } = route.params;
  const dispatch = useAppDispatch();

  const { items } = useAppSelector((state) => state.products);
  const { items: favorites } = useAppSelector((state) => state.favorites);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Check if favorite
  const isFavorite = favorites.some((fav) => fav.id === productId);

  // Create image array for carousel (using same image multiple times for demo)
  const images = product ? [product.image, product.image, product.image] : [];

  useEffect(() => {
    // Find product from cached items first
    const foundProduct = items.find((item) => item.id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
      setLoading(false);
      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setError('Product not found');
      setLoading(false);
    }
  }, [productId, items, fadeAnim, slideAnim]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(() => {
    if (!product) return;

    // Animate heart
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.3,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    if (isFavorite) {
      dispatch(removeFavorite(product.id));
    } else {
      dispatch(addFavorite(product));
    }
  }, [product, isFavorite, dispatch, heartScale]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Image carousel scroll handler
  const handleImageScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  // Header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Image scale based on scroll (parallax effect)
  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.5, 1],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT],
    outputRange: [0, -IMAGE_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  if (loading) {
    return <ProductDetailShimmer />;
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <TouchableOpacity style={styles.backButtonError} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <ErrorView
          message={error || 'Product not found'}
          onRetry={handleBack}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {product.title}
          </Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleFavoriteToggle}>
            <Animated.Text
              style={[
                styles.headerIcon,
                { transform: [{ scale: heartScale }] },
              ]}>
              {isFavorite ? '❤️' : '🤍'}
            </Animated.Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Floating Back Button */}
      <Animated.View
        style={[styles.floatingBackButton, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleBack}>
          <Text style={styles.floatingIcon}>←</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Floating Favorite Button */}
      <Animated.View
        style={[styles.floatingFavoriteButton, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleFavoriteToggle}>
          <Animated.Text
            style={[
              styles.floatingIcon,
              { transform: [{ scale: heartScale }] },
            ]}>
            {isFavorite ? '❤️' : '🤍'}
          </Animated.Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <Animated.View
          style={[
            styles.imageCarouselContainer,
            {
              transform: [
                { scale: imageScale },
                { translateY: imageTranslateY },
              ],
            },
          ]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageSlide}>
                <Image
                  source={{ uri: image }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentImageIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Product Details */}
        <Animated.View
          style={[
            styles.detailsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{product.title}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{product.rating.rate}</Text>
            <Text style={styles.ratingCount}>
              ({product.rating.count} reviews)
            </Text>
          </View>

          {/* Price */}
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Add to Cart Button (UI only) */}
          <TouchableOpacity style={styles.addToCartButton} activeOpacity={0.8}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButtonError: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: COLORS.background,
    zIndex: 100,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  floatingBackButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 50,
  },
  floatingFavoriteButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 50,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  floatingIcon: {
    fontSize: 22,
  },
  imageCarouselContainer: {
    height: IMAGE_HEIGHT,
    backgroundColor: '#FFFFFF',
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  detailsContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    marginBottom: SPACING.md,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 32,
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  star: {
    fontSize: 16,
    marginRight: 4,
  },
  rating: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  ratingCount: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  descriptionContainer: {
    marginBottom: SPACING.xl,
  },
  descriptionLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addToCartText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
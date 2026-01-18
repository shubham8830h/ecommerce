import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ShimmerPlaceholder = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

export const ProductCardShimmer = ({ style }) => {
  return (
    <View style={[styles.cardContainer, style]}>
      <ShimmerPlaceholder height={150} borderRadius={12} />
      <View style={styles.cardContent}>
        <ShimmerPlaceholder height={16} width="90%" style={styles.mb8} />
        <ShimmerPlaceholder height={14} width="60%" style={styles.mb8} />
        <ShimmerPlaceholder height={20} width="40%" />
      </View>
    </View>
  );
};

export const ProductGridShimmer = () => {
  return (
    <View style={styles.gridContainer}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <ProductCardShimmer key={item} style={styles.gridItem} />
      ))}
    </View>
  );
};

export const ProductDetailShimmer = () => {
  return (
    <View style={styles.detailContainer}>
      <ShimmerPlaceholder height={300} borderRadius={0} />
      <View style={styles.detailContent}>
        <ShimmerPlaceholder height={28} width="80%" style={styles.mb16} />
        <ShimmerPlaceholder height={24} width="30%" style={styles.mb16} />
        <ShimmerPlaceholder height={16} style={styles.mb8} />
        <ShimmerPlaceholder height={16} style={styles.mb8} />
        <ShimmerPlaceholder height={16} width="70%" style={styles.mb8} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.shimmer,
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.shimmerHighlight,
    opacity: 0.5,
  },
  cardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 12,
  },
  mb8: {
    marginBottom: 8,
  },
  mb16: {
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  gridItem: {
    width: (SCREEN_WIDTH - 48) / 2,
    margin: 8,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  detailContent: {
    padding: 16,
  },
});
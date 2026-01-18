import React, { useRef, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const ErrorView = ({ message, onRetry, isOffline = false }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Bounce animation for icon
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    bounce.start();

    return () => bounce.stop();
  }, [bounceAnim, fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ translateY: bounceAnim }] },
        ]}>
        <Text style={styles.icon}>{isOffline ? '📡' : '⚠️'}</Text>
      </Animated.View>

      <Text style={styles.title}>
        {isOffline ? 'No Internet Connection' : 'Oops! Something went wrong'}
      </Text>

      <Text style={styles.message}>{message}</Text>

      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export const OfflineBanner = ({ visible }) => {
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : -50,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }] }]}>
      <Text style={styles.bannerIcon}>📡</Text>
      <Text style={styles.bannerText}>
        You're offline. Showing cached data.
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    zIndex: 1000,
  },
  bannerIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
});
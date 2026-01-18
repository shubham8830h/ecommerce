import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const LoadingFooter = ({ loading }) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) return;

    const createAnimation = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );

    const anim1 = createAnimation(dot1Anim, 0);
    const anim2 = createAnimation(dot2Anim, 100);
    const anim3 = createAnimation(dot3Anim, 200);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [loading, dot1Anim, dot2Anim, dot3Anim]);

  if (!loading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            {
              transform: [
                {
                  scale: dot1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.5],
                  }),
                },
              ],
              opacity: dot1Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              transform: [
                {
                  scale: dot2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.5],
                  }),
                },
              ],
              opacity: dot2Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              transform: [
                {
                  scale: dot3Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.5],
                  }),
                },
              ],
              opacity: dot3Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.text}>Loading more...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginHorizontal: 4,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
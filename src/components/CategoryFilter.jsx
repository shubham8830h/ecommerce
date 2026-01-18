import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <CategoryChip
          label="All"
          isSelected={selectedCategory === null}
          onPress={() => onSelectCategory(null)}
          index={0}
        />
        {categories.map((category, index) => (
          <CategoryChip
            key={category}
            label={category}
            isSelected={selectedCategory === category}
            onPress={() => onSelectCategory(category)}
            index={index + 1}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const CategoryChip = ({ label, isSelected, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, index]);

  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: isSelected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSelected, bgAnim]);

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.card, COLORS.primary],
  });

  const textColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.text, '#FFFFFF'],
  });

  const formatLabel = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <Animated.View
      style={[
        styles.chipContainer,
        { transform: [{ scale: scaleAnim }] },
      ]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Animated.View
          style={[
            styles.chip,
            { backgroundColor },
            isSelected && styles.chipSelected,
          ]}>
          <Animated.Text style={[styles.chipText, { color: textColor }]}>
            {formatLabel(label)}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
  },
  chipContainer: {
    marginRight: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  chipSelected: {
    borderColor: COLORS.primary,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
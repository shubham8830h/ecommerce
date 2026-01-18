import React, { useState, useRef } from 'react';
import {
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Text,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

export const SearchBar = ({ value, onChangeText, placeholder = 'Search products...' }) => {
  const [, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.primary],
  });

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <Animated.View style={[styles.container, { borderColor }]}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
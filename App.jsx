/**
 * E-Commerce Mini App
 * A React Native Product Listing Application
 */

import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { AppNavigator } from './src/navigation';
import { COLORS } from './src/constants';

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={COLORS.background}
          />
          <AppNavigator />
        </View>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
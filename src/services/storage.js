import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

class StorageService {
  // Products Cache
  async cacheProducts(products) {
    try {
      const data = JSON.stringify({
        products,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS_CACHE, data);
    } catch (error) {
      console.error('Error caching products:', error);
    }
  }

  async getCachedProducts() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS_CACHE);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error getting cached products:', error);
      return null;
    }
  }

  // Categories Cache
  async cacheCategories(categories) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CATEGORIES_CACHE,
        JSON.stringify(categories),
      );
    } catch (error) {
      console.error('Error caching categories:', error);
    }
  }

  async getCachedCategories() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES_CACHE);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error getting cached categories:', error);
      return null;
    }
  }

  // Favorites
  async saveFavorites(favorites) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(favorites),
      );
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  async getFavorites() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  async addFavorite(product) {
    try {
      const favorites = await this.getFavorites();
      const exists = favorites.some((fav) => fav.id === product.id);
      if (!exists) {
        const updatedFavorites = [...favorites, product];
        await this.saveFavorites(updatedFavorites);
        return updatedFavorites;
      }
      return favorites;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return [];
    }
  }

  async removeFavorite(productId) {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter((fav) => fav.id !== productId);
      await this.saveFavorites(updatedFavorites);
      return updatedFavorites;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return [];
    }
  }

  async isFavorite(productId) {
    try {
      const favorites = await this.getFavorites();
      return favorites.some((fav) => fav.id === productId);
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
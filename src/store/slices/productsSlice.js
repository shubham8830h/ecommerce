import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { ITEMS_PER_PAGE } from '../../constants';

const initialState = {
  items: [],
  filteredItems: [],
  categories: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  isRefreshing: false,
  searchQuery: '',
  selectedCategory: null,
  isOffline: false,
};

// Async Thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const products = await apiService.getProducts();
      // Cache products for offline use
      await storageService.cacheProducts(products);
      return products;
    } catch (error) {
      // Try to get cached products
      const cached = await storageService.getCachedProducts();
      if (cached) {
        return { products: cached.products, isOffline: true };
      }
      if (error.message) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch products');
    }
  },
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await apiService.getCategories();
      // Cache categories
      await storageService.cacheCategories(categories);
      return categories;
    } catch (error) {
      // Try to get cached categories
      const cached = await storageService.getCachedCategories();
      if (cached) {
        return cached;
      }
      if (error.message) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch categories');
    }
  },
);

export const loadCachedProducts = createAsyncThunk(
  'products/loadCachedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await storageService.getCachedProducts();
      if (cached) {
        return cached.products;
      }
      return [];
    } catch (error) {
      if (error.message) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to load cached products');
    }
  },
);

export const loadCachedCategories = createAsyncThunk(
  'products/loadCachedCategories',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await storageService.getCachedCategories();
      if (cached) {
        return cached;
      }
      return [];
    } catch (error) {
      if (error.message) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to load cached categories');
    }
  },
);

// Helper function to filter products
const filterProducts = (items, searchQuery, selectedCategory) => {
  let filtered = [...items];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((item) =>
      item.title.toLowerCase().includes(query),
    );
  }

  if (selectedCategory) {
    filtered = filtered.filter((item) => item.category === selectedCategory);
  }

  return filtered;
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.filteredItems = filterProducts(
        state.items,
        action.payload,
        state.selectedCategory,
      );
      state.page = 1;
      state.hasMore = state.filteredItems.length > ITEMS_PER_PAGE;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.filteredItems = filterProducts(
        state.items,
        state.searchQuery,
        action.payload,
      );
      state.page = 1;
      state.hasMore = state.filteredItems.length > ITEMS_PER_PAGE;
    },
    loadMoreProducts: (state) => {
      const totalFiltered = filterProducts(
        state.items,
        state.searchQuery,
        state.selectedCategory,
      );
      const nextPage = state.page + 1;
      const endIndex = nextPage * ITEMS_PER_PAGE;

      if (endIndex >= totalFiltered.length) {
        state.hasMore = false;
      }
      state.page = nextPage;
    },
    setRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
    },
    setOffline: (state, action) => {
      state.isOffline = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        if (!state.isRefreshing) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.isRefreshing = false;

        // Check if offline response
        if (action.payload && typeof action.payload === 'object' && 'isOffline' in action.payload) {
          state.items = action.payload.products;
          state.isOffline = true;
        } else {
          state.items = action.payload;
          state.isOffline = false;
        }

        state.filteredItems = filterProducts(
          state.items,
          state.searchQuery,
          state.selectedCategory,
        );
        state.page = 1;
        state.hasMore = state.filteredItems.length > ITEMS_PER_PAGE;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.isRefreshing = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        // Categories loading handled separately
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        // Categories error handled silently
        console.error('Categories fetch failed:', action.payload);
      })
      // Load Cached Products
      .addCase(loadCachedProducts.fulfilled, (state, action) => {
        if (state.items.length === 0 && action.payload.length > 0) {
          state.items = action.payload;
          state.filteredItems = filterProducts(
            action.payload,
            state.searchQuery,
            state.selectedCategory,
          );
          state.hasMore = state.filteredItems.length > ITEMS_PER_PAGE;
        }
      })
      // Load Cached Categories
      .addCase(loadCachedCategories.fulfilled, (state, action) => {
        if (state.categories.length === 0 && action.payload.length > 0) {
          state.categories = action.payload;
        }
      });
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  loadMoreProducts,
  setRefreshing,
  setOffline,
  clearError,
} = productsSlice.actions;

export default productsSlice.reducer;
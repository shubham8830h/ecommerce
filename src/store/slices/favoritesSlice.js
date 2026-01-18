import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storageService } from '../../services/storage';

const initialState = {
  items: [],
  loading: false,
};

// Async Thunks
export const loadFavorites = createAsyncThunk(
  'favorites/loadFavorites',
  async () => {
    const favorites = await storageService.getFavorites();
    return favorites;
  },
);

export const addFavorite = createAsyncThunk(
  'favorites/addFavorite',
  async (product) => {
    const updatedFavorites = await storageService.addFavorite(product);
    return updatedFavorites;
  },
);

export const removeFavorite = createAsyncThunk(
  'favorites/removeFavorite',
  async (productId) => {
    const updatedFavorites = await storageService.removeFavorite(productId);
    return updatedFavorites;
  },
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Load Favorites
      .addCase(loadFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadFavorites.rejected, (state) => {
        state.loading = false;
      })
      // Add Favorite
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      // Remove Favorite
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default favoritesSlice.reducer;
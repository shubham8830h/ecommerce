import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import favoritesReducer from './slices/favoritesSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const RootState = {}; // Placeholder - types removed for JavaScript
export const AppDispatch = {}; // Placeholder - types removed for JavaScript
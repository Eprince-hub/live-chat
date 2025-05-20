import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import streamReducer from './slices/streamSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stream: streamReducer,
    product: productReducer,
    order: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
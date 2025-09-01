import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import requestsSlice from './slices/requestsSlice';
import { apiSlice } from './slices/apiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    requests: requestsSlice,
    api: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
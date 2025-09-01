import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  myRequests: [],
  availableRequests: [],
  currentRequest: null,
  loading: false,
  error: null,
  refreshing: false,
};

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.refreshing = false;
    },
    clearError: (state) => {
      state.error = null;
    },

    // My requests (for victims)
    setMyRequests: (state, action) => {
      state.myRequests = action.payload;
      state.loading = false;
      state.refreshing = false;
    },
    addMyRequest: (state, action) => {
      state.myRequests.unshift(action.payload);
    },
    updateMyRequest: (state, action) => {
      const index = state.myRequests.findIndex(req => req.id === action.payload.id);
      if (index !== -1) {
        state.myRequests[index] = { ...state.myRequests[index], ...action.payload };
      }
    },

    // Available requests (for volunteers/organizations)
    setAvailableRequests: (state, action) => {
      state.availableRequests = action.payload;
      state.loading = false;
      state.refreshing = false;
    },
    removeAvailableRequest: (state, action) => {
      state.availableRequests = state.availableRequests.filter(
        req => req.id !== action.payload
      );
    },

    // Current request details
    setCurrentRequest: (state, action) => {
      state.currentRequest = action.payload;
      state.loading = false;
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },

    // Reset state
    resetRequests: (state) => {
      return initialState;
    },
  },
});

export const {
  setLoading,
  setRefreshing,
  setError,
  clearError,
  setMyRequests,
  addMyRequest,
  updateMyRequest,
  setAvailableRequests,
  removeAvailableRequest,
  setCurrentRequest,
  clearCurrentRequest,
  resetRequests,
} = requestsSlice.actions;

// Selectors
export const selectMyRequests = (state) => state.requests.myRequests;
export const selectAvailableRequests = (state) => state.requests.availableRequests;
export const selectCurrentRequest = (state) => state.requests.currentRequest;
export const selectRequestsLoading = (state) => state.requests.loading;
export const selectRequestsError = (state) => state.requests.error;
export const selectRequestsRefreshing = (state) => state.requests.refreshing;

export default requestsSlice.reducer;
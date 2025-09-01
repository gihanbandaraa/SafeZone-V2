import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const baseQuery = fetchBaseQuery({
  baseUrl: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api',
  prepareHeaders: async (headers) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Request', 'Organization'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    // User endpoints
    getProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/users/profile',
        method: 'PATCH',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Request endpoints
    getRequests: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams(params);
        return `/requests?${queryParams}`;
      },
      providesTags: ['Request'],
    }),
    createRequest: builder.mutation({
      query: (requestData) => ({
        url: '/requests',
        method: 'POST',
        body: requestData,
      }),
      invalidatesTags: ['Request'],
    }),
    updateRequestStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/requests/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Request'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetRequestsQuery,
  useCreateRequestMutation,
  useUpdateRequestStatusMutation,
} = apiSlice;
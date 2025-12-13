
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '../../types';
import axios from 'axios';
import { BASE_URL } from '../../constants/helperConstants';

// Type for API error response
interface ApiError {
  message?: string;
  [key: string]: unknown;
}

interface AuthResponse {
  success: boolean;
  access_token: string;
  expires_at: string;
  user?: User;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const googleLogin = createAsyncThunk<AuthResponse, string>(
  'auth/sheepmate/googleLogin',
  async (credential, { rejectWithValue }) => {
    try {
      // Store the Google Access Token for later use (Gmail API)
      localStorage.setItem('google_access_token', credential);

      // Send the Google Access Token to the backend for verification/session creation
      const response = await axios.post<AuthResponse>(`${BASE_URL}/auth/sheepmate/google`, { token: credential });
      const { access_token, expires_at } = response.data;

      if (access_token) {
        localStorage.setItem('token', access_token);
        localStorage.setItem('expires_at', expires_at);
      }
      return response.data;
    } catch (error: unknown) {
      // Error handling similar to login
      if (error && typeof error === 'object') {
        const axiosError = error as {
          response?: { data?: ApiError };
          request?: unknown;
          message?: string;
        };
        if (axiosError.response?.data) {
          return rejectWithValue(axiosError.response.data.message || 'Google Login failed');
        }
      }
      return rejectWithValue('Google Login failed');
    }
  }
);

export const logout = createAsyncThunk('auth/sheepmate/logout', async (_, { rejectWithValue }) => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('expires_at');
    return { success: true };
  } catch (error: unknown) {
    localStorage.removeItem('token');
    localStorage.removeItem('expires_at');
    return rejectWithValue('An unknown error occurred during logout');
  }
});


export const getMe = createAsyncThunk('auth/sheepmate/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<User>(`${BASE_URL}/auth/sheepmate/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  } catch (error: unknown) {

    if (error && typeof error === 'object') {
      const axiosError = error as {
        response?: { data?: ApiError };
        request?: unknown;
        message?: string;
      };

      if (axiosError.response?.data) {
        return rejectWithValue(axiosError.response.data.message || 'user data get failed');
      } else if (axiosError.request) {
        return rejectWithValue('No response from server during logout');
      }
      return rejectWithValue(axiosError.message || 'An unknown error occurred during logout');
    }

    return rejectWithValue('An unknown error occurred during logout');
  }
});


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      const token = localStorage.getItem('token');
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      }
    }
  },
  extraReducers: (builder) => {

    builder.addCase(googleLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(googleLogin.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = payload.access_token;
      state.user = payload.user || null;
    });
    builder.addCase(googleLogin.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload as string;
    });

    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    });

    builder.addCase(getMe.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getMe.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = payload || null;
    });
    builder.addCase(getMe.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload as string;
    });
  },
});

export const { initializeAuth } = authSlice.actions;

export default authSlice.reducer;

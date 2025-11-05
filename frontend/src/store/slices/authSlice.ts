import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { User, UserLoginFormData, UserRegistrationFormData } from '../../types';
import axios from 'axios';
// const BASE_URL = "http://127.0.0.1:8000"; // FastAPI backend
const BASE_URL = "https://ai.vinciis.in"; // FastAPI backend



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

export const signup = createAsyncThunk<AuthResponse, UserRegistrationFormData>(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>(`${BASE_URL}/auth/signup`, userData);
      const { access_token, expires_at } = response.data;
      
      if (access_token) {
        localStorage.setItem('token', access_token);
        localStorage.setItem('expires_at', expires_at)

        // Optionally fetch user data here if not returned in the response
        // const userResponse = await axios.get(`${nodeurl}/auth/me`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // return { ...response.data, user: userResponse.data };
      }
      
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object') {
        const axiosError = error as {
          response?: { data?: ApiError };
          request?: unknown;
          message?: string;
        };
        
        if (axiosError.response?.data) {
          return rejectWithValue(axiosError.response.data.message || 'Signup failed');
        } else if (axiosError.request) {
          return rejectWithValue('No response from server');
        }
        return rejectWithValue(axiosError.message || 'An unknown error occurred during signup');
      }
      return rejectWithValue('An unknown error occurred during signup');
    }
  }
);

export const login = createAsyncThunk<AuthResponse, UserLoginFormData>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>(`${BASE_URL}/auth/login`, credentials);
      const { access_token, expires_at } = response.data;
      
      if (access_token) {
        console.log(access_token, expires_at);

        localStorage.setItem('token', access_token);
        localStorage.setItem('expires_at', expires_at)
        // Optionally fetch user data here if not returned in the response
        // const userResponse = await axios.get(`${nodeurl}/auth/me`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // return { ...response.data, user: userResponse.data };
      }
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object') {
        const axiosError = error as {
          response?: { data?: ApiError };
          request?: unknown;
          message?: string;
        };
        
        if (axiosError.response?.data) {
          return rejectWithValue(axiosError.response.data.message || 'Login failed');
        } else if (axiosError.request) {
          return rejectWithValue('No response from server');
        }
        return rejectWithValue(axiosError.message || 'An unknown error occurred during login');
      }
      return rejectWithValue('An unknown error occurred during login');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    // If you have a logout endpoint, you can call it here
    // await axios.post(`${nodeurl}/auth/logout`, {}, {
    //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    // });
    
    localStorage.removeItem('token');
    localStorage.removeItem('expires_at');
    return { success: true };
  } catch (error: unknown) {
    // Even if logout fails, we should still clear the token
    localStorage.removeItem('token');
    localStorage.removeItem('expires_at');
    
    if (error && typeof error === 'object') {
      const axiosError = error as {
        response?: { data?: ApiError };
        request?: unknown;
        message?: string;
      };
      
      if (axiosError.response?.data) {
        return rejectWithValue(axiosError.response.data.message || 'Logout failed');
      } else if (axiosError.request) {
        return rejectWithValue('No response from server during logout');
      }
      return rejectWithValue(axiosError.message || 'An unknown error occurred during logout');
    }
    
    return rejectWithValue('An unknown error occurred during logout');
  }
});


export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    // If you have a logout endpoint, you can call it here
    const response = await axios.get<User>(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  } catch (error: unknown) {
    // Even if logout fails, we should still clear the token
    
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
    // Add a reducer to initialize auth state from localStorage on app load
    initializeAuth: (state) => {
      const token = localStorage.getItem('token');
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
        // You might want to fetch user data here if not already in state
      }
    }
  },
  extraReducers: (builder) => {
    // Handle signup
    builder.addCase(signup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signup.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = payload.access_token;
      state.user = payload.user || null;
    });
    builder.addCase(signup.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload as string;
    });

    // Handle login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = payload.access_token;
      state.user = payload.user || null;
    });
    builder.addCase(login.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload as string;
    });

    // Handle logout
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    });

    // Handle getMe
    builder.addCase(getMe.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getMe.fulfilled, (state, { payload }) => {
      console.log(payload)
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

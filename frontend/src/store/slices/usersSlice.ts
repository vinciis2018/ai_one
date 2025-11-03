import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { User } from '../../types';
const BASE_URL = "http://127.0.0.1:8000"; // FastAPI backend


interface Pagination {
  next?: {
    page: number;
    limit: number;
  };
  prev?: {
    page: number;
    limit: number;
  };
  total?: number;
  currentPage?: number;
  totalPages?: number;
}

interface UsersState {
  users: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  user: User | null;
  pagination: Pagination;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

const initialState: UsersState = {
  users: [],
  status: 'idle',
  error: null,
  user: null,
  pagination: {},
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
};

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface CreateUserPayload {
  name: string;
  role: string;
}

export const createUser = createAsyncThunk<User, CreateUserPayload, { rejectValue: string }>(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      console.log(userData)
      const response = await axios.post<User>(`${BASE_URL}/users/create`, {
        name: userData.name,
        role: userData.role,
      });
      return response.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to create site'
        );
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

interface ApiPagination {
  next?: {
    page: number;
    limit: number;
  };
  prev?: {
    page: number;
    limit: number;
  };
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

interface ApiResponse<T> {
  success: boolean;
  count: number;
  pagination: ApiPagination;
  data: T;
  users?: T; // For backward compatibility
}

interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getAllUsers = createAsyncThunk<
  { users: User[]; pagination: ApiPagination },
  FetchUsersParams | undefined,
  { rejectValue: string }
>(
  'users/fetchAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '' } = params;
      const response = await axios.get<ApiResponse<User>>(`${BASE_URL}/users/all`, {
        params: {
          page,
          limit,
          ...(search && { search })
        }
      });
      
      // Handle both response formats
      const users = Array.isArray(response.data.data) ? response.data.data : 
                  (Array.isArray(response.data.users) ? response.data.users : []);
      
      const pagination = response.data.pagination || {
        total: users.length,
        currentPage: page,
        totalPages: Math.ceil(users.length / limit),
        limit
      };
      
      return {
        users,
        pagination
      };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError?.response?.data?.message) {
        return rejectWithValue(axiosError.response.data.message);
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

export const getUserDetails = createAsyncThunk<User, string, { rejectValue: string }>(
  'users/getUsersDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse<User>>(`${BASE_URL}/users/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch campaign details: Invalid response format');
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to fetch campaign details'
        );
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const updateUser = createAsyncThunk<User, { id: string; userData: Partial<User> }, { rejectValue: string }>(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      console.log(id)
      const response = await axios.post<ApiResponse<User>>(
        `${BASE_URL}/users/update/${id}`,
        {userId: id, ...userData}
      );
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to update site: Invalid response format');
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } }, message?: string };
        return rejectWithValue(
          axiosError.response?.data?.message || axiosError.message || 'Failed to update site'
        );
      }
      return rejectWithValue('An unknown error occurred while updating site');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users.unshift(action.payload);
        state.totalItems += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to create site';
      })
      .addCase(getAllUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
        state.currentPage = action.payload.pagination?.currentPage || 1;
        state.itemsPerPage = action.payload.pagination?.limit || 10;
        state.totalItems = action.payload.pagination?.total || action.payload.users.length;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch users';
      })
      .addCase(getUserDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch campaigns';
      })
      .addCase(updateUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        // Update the site in the sites array if it exists there
        state.users = state.users.map(user => 
          user._id === action.payload._id ? action.payload : user
        );
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to update site';
      })
  },
});

export const { resetStatus } = usersSlice.actions;

export default usersSlice.reducer;

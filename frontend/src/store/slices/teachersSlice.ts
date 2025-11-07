import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../constants/helperConstants';

// -----------------------------
// Types
// -----------------------------

export interface TeacherModel {
  _id?: string;
  id?: string;
  user_id: string;
  avatar?: string;
  name: string;
  email: string;
  subjects?: string[];
  documents?: string[];
  created_at?: string;
  updated_at?: string;
}

interface TeacherState {
  all_teachers: TeacherModel[];
  teacher_details: TeacherModel | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: TeacherState = {
  all_teachers: [],
  teacher_details: null,
  loading: false,
  error: null,
  success: false,
};

// Teacher-specific thunks
export const getTeacherDetails = createAsyncThunk<TeacherModel, string>(
  'teachers/getTeacherDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<TeacherModel>(`${BASE_URL}/teachers/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load teacher details');
    }
  }
);

export const getAllTeachers = createAsyncThunk<
  { teachers: TeacherModel[]; count: number },
  { page?: number; limit?: number; search?: string, user_id?: string } | undefined,
  { rejectValue: string }
>(
  'teachers/getAllTeachers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '', user_id } = params;
      const skip = (page - 1) * limit;
      const response = await axios.get<{ teachers: TeacherModel[]; count: number }>(`${BASE_URL}/teachers`, {
        params: { skip, limit, search, user_id },
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load teachers');
    }
  }
);

const teachersSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    resetTeacherState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.teacher_details = null;
    },
    clearTeacherError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Teacher Details
      .addCase(getTeacherDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeacherDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.teacher_details = action.payload;
      })
      .addCase(getTeacherDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch All Teachers
      .addCase(getAllTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // action.payload has shape { teachers, count }
        state.all_teachers = action.payload.teachers;
      })
      .addCase(getAllTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetTeacherState, clearTeacherError } = teachersSlice.actions;
export default teachersSlice.reducer;

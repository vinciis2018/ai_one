import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../constants/helperConstants';

// -----------------------------
// Types
// -----------------------------
interface PsuedoCoachingModel {
  id: string,
  name: string,
  type?: string,
}

export interface StudentModel {
  _id?: string;
  id?: string;
  user_id: string;
  avatar?: string;
  name: string;
  email: string;
  subjects?: string[];
  documents?: string[];
  teachers?: string[];
  organization?: PsuedoCoachingModel;
  created_at?: string;
  updated_at?: string;
}


interface StudentState {
  all_students: StudentModel[];
  student_details: StudentModel | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: StudentState = {
  all_students: [],
  student_details: null,
  loading: false,
  error: null,
  success: false,
};

// Student-specific thunks
export const getStudentDetails = createAsyncThunk<StudentModel, string>(
  'students/getStudentDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<StudentModel>(`${BASE_URL}/students/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load student details');
    }
  }
);

export const getAllStudents = createAsyncThunk<
  { students: StudentModel[]; count: number },
  { page?: number; limit?: number; search?: string, user_id?: string } | undefined,
  { rejectValue: string }
>(
  'students/getAllStudents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '', user_id } = params;
      const skip = (page - 1) * limit;
      const response = await axios.get<{ students: StudentModel[]; count: number }>(`${BASE_URL}/students`, {
        params: { skip, limit, search, user_id },
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load students');
    }
  }
);

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    resetStudentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.student_details = null;
    },
    clearStudentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Student Details
      .addCase(getStudentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.student_details = action.payload;
      })
      .addCase(getStudentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch All Students
      .addCase(getAllStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getAllStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // action.payload has shape { students, count }
        state.all_students = action.payload.students;
      })
      .addCase(getAllStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetStudentState, clearStudentError } = studentsSlice.actions;
export default studentsSlice.reducer;

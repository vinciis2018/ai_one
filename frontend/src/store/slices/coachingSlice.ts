import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../constants/helperConstants';
import type { TeacherModel } from './teachersSlice';
import type { StudentModel } from './studentsSlice';
// const BASE_URL = "http://127.0.0.1:8000"; // FastAPI backend
// const BASE_URL = "https://ai.vinciis.in"; // FastAPI backend

// -----------------------------
// Types
// -----------------------------

export interface OrganisationModel {
  _id: string;
  name: string;
  description?: string;
  source_type: string;
  admin_id: string;
  teachers?: string[]; // array of teacher IDs
  students?: string[]; // array of student IDs
  subjects?: string[];
  avatar?: string;
  documents?: string[]; // array of document IDs
  created_at?: string;
  updated_at?: string;
}
export interface UploadRequestPayload {
  fileName: string;
  s3Url: string;
  source_type: string;
  user_id: string;
  domain: string;
  type: string;
  file_type: string;
  file_size?: number;
}

interface CoachingState {
  coachings: OrganisationModel[] | unknown;
  coachingDetails: OrganisationModel | null | unknown;
  teachers: TeacherModel[];       // list for institute
  students: StudentModel[];       // list for institute
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Initial state
const initialState: CoachingState = {
  coachings: [],
  coachingDetails: null,
  teachers: [],
  students: [],
  loading: false,
  error: null,
  success: false,
};

// Async thunks
export const createCoaching = createAsyncThunk(
  'coaching/createCoaching',
  async (coachingData, { rejectWithValue }) => {
    try {
      const response = await axios.post<OrganisationModel>(`${BASE_URL}/coachings`, coachingData);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load conversations');
    }
  }
);

export const getCoachingDetails = createAsyncThunk(
  'coaching/getCoachingDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/coachings/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load conversations');
    }
  }
);

export const updateCoaching = createAsyncThunk(
  'coaching/updateCoaching',
  async ({ id, coachingData }: { id: string; coachingData: OrganisationModel }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/coachings/${id}`, coachingData);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load conversations');
    }
  }
);

export const getAllCoachings = createAsyncThunk(
  'coaching/getAllCoachings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/coachings`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load conversations');
    }
  }
);

// New: list teachers for institute
export const listInstituteTeachers = createAsyncThunk(
  'coaching/listInstituteTeachers',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/coachings/${id}/teachers/`);
      return response.data as TeacherModel[];
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || "Failed to fetch teachers");
    }
  }
);

// New: add teacher to institute
export const addTeacherToInstitute = createAsyncThunk(
  'coaching/addTeacherToInstitute',
  async ({ coaching_id, teacher }: { coaching_id: string; teacher: TeacherModel }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/coachings/${coaching_id}/teachers/`, teacher);
      return response.data; // backend returns { message, teacher_id }
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || "Failed to add teacher");
    }
  }
);

// New: list students for institute
export const listInstituteStudents = createAsyncThunk(
  'coaching/listInstituteStudents',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/coachings/${id}/students/`);
      return response.data as StudentModel[];
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || "Failed to fetch students");
    }
  }
);

// New: add student to institute
export const addStudentToInstitute = createAsyncThunk(
  'coaching/addStudentToInstitute',
  async ({ coaching_id, student }: { coaching_id: string; student: StudentModel }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/coachings/${coaching_id}/students/`, {coaching_id, student});
      return response.data; // backend returns { message, student_id }
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || "Failed to add student");
    }
  }
);



// New: add student to institute
export const addStudentToTeacher = createAsyncThunk(
  'coaching/addStudentToTeacher',
  async ({ teacher_id, student }: { teacher_id: string; student: StudentModel }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/coachings/add/student/${teacher_id}/`, student);
      return response.data; // backend returns { message, student_id }
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || "Failed to add student");
    }
  }
);


// Slice
const coachingSlice = createSlice({
  name: 'coaching',
  initialState,
  reducers: {
    resetCoachingState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.coachingDetails = null;
      state.teachers = [];
      state.students = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Coaching
      .addCase(createCoaching.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCoaching.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.coachingDetails = action.payload;
      })
      .addCase(createCoaching.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error loading conversation';
      })
      // Get Coaching Details
      .addCase(getCoachingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCoachingDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.coachingDetails = action.payload;
      })
      .addCase(getCoachingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error loading conversation';
      })
      // Update Coaching
      .addCase(updateCoaching.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCoaching.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.coachingDetails = action.payload;
      })
      .addCase(updateCoaching.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error loading conversation';
      })
      // Get All Coachings
      .addCase(getAllCoachings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCoachings.fulfilled, (state, action) => {
        state.loading = false;
        state.coachings = action.payload;
      })
      .addCase(getAllCoachings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error loading conversation';
      })
      // Teachers
      .addCase(listInstituteTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listInstituteTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload;
      })
      .addCase(listInstituteTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addTeacherToInstitute.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addTeacherToInstitute.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(addTeacherToInstitute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Students
      .addCase(listInstituteStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listInstituteStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(listInstituteStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addStudentToInstitute.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addStudentToInstitute.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(addStudentToInstitute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(addStudentToTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addStudentToTeacher.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(addStudentToTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetCoachingState } = coachingSlice.actions;
export default coachingSlice.reducer;

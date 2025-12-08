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
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  students: string[];
  subject?: string;
  location?: string;
  recurrence?: string;
  status: string;
}

export interface TeacherModel {
  _id?: string;
  id?: string;
  user_id: string;
  avatar?: string;
  name: string;
  email: string;
  subjects?: string[];
  documents?: string[];
  students?: string[];
  organization?: PsuedoCoachingModel;
  calendar?: { events: CalendarEvent[] };
  persona?: {
    personality?: string;
    answer_style?: string;
    youtube_video_url?: string;
  }
  created_at?: string;
  updated_at?: string;
}

interface TeacherState {
  all_teachers: TeacherModel[];
  teacher_details: TeacherModel | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  student_analytics: any | null;
  teacher_landing_page_analytics: any | null;
}

const initialState: TeacherState = {
  all_teachers: [],
  teacher_details: null,
  loading: false,
  error: null,
  success: false,
  student_analytics: null,
  teacher_landing_page_analytics: null,
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

export const getTeacherLandingPageAnalytics = createAsyncThunk<any, string>(
  'teachers/getTeacherLandingPageAnalytics',
  async (teacher_user_id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/teachers/${teacher_user_id}/landing-page-analytics`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load student analytics');
    }
  }
);

export const getStudentAnalytics = createAsyncThunk<any, string>(
  'teachers/getStudentAnalytics',
  async (studentId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/teachers/student-analytics/${studentId}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load student analytics');
    }
  }
);


export const addCalendarEvent = createAsyncThunk<
  CalendarEvent,
  { teacherId: string; event: Omit<CalendarEvent, 'id'> },
  { rejectValue: string }
>(
  'teachers/addCalendarEvent',
  async ({ teacherId, event }, { rejectWithValue }) => {
    try {
      const response = await axios.post<CalendarEvent>(`${BASE_URL}/teachers/calendar/event`, { teacher_id: teacherId, event: event });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to add calendar event');
    }
  }
);


export const updateTeacherPersona = createAsyncThunk<
  TeacherModel,
  { teacherId: string; persona: { personality?: string; answer_style?: string; youtube_video_url?: string } },
  { rejectValue: string }
>(
  'teachers/updateTeacherPersona',
  async ({ teacherId, persona }, { rejectWithValue }) => {
    try {
      const response = await axios.put<TeacherModel>(`${BASE_URL}/teachers/update-persona/${teacherId}`, { teacher_id: teacherId, persona: persona });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to update teacher persona');
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
      state.student_analytics = null;
      state.teacher_landing_page_analytics = null;
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
      })
      // Get landing page Analytics
      .addCase(getTeacherLandingPageAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeacherLandingPageAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.teacher_landing_page_analytics = action.payload;
      })
      .addCase(getTeacherLandingPageAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Student Analytics
      .addCase(getStudentAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudentAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.student_analytics = action.payload;
      })
      .addCase(getStudentAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Calendar Event
      .addCase(addCalendarEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCalendarEvent.fulfilled, (state, action) => {
        state.loading = false;
        if (state.teacher_details) {
          if (!state.teacher_details.calendar) {
            state.teacher_details.calendar = { events: [] };
          }
          state.teacher_details.calendar.events.push(action.payload);
        }
      })
      .addCase(addCalendarEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Teacher Persona
      .addCase(updateTeacherPersona.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeacherPersona.fulfilled, (state, action) => {
        state.loading = false;
        if (state.teacher_details) {
          state.teacher_details = action.payload;
        }
      })
      .addCase(updateTeacherPersona.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetTeacherState, clearTeacherError } = teachersSlice.actions;
export default teachersSlice.reducer;

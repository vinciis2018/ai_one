// ============================================
// notesSlice.ts
// Redux slice for notes and transcriptions
// ============================================

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from '../../constants/helperConstants';

export interface NoteItem {
  id: string;
  page_number: number;
  image_url: string;
  document_id: string;
  user_id: string;
  transcription?: string;
  created_at: string;
  updated_at?: string;
}

interface NotesState {
  notes: NoteItem[];
  selectedNote: NoteItem | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  transcriptionStatus: "idle" | "loading" | "succeeded" | "failed";
  saveStatus: "idle" | "loading" | "succeeded" | "failed";
  quizStatus: "idle" | "loading" | "succeeded" | "failed";
  quizData: any | null;
  mcqStatus: "idle" | "loading" | "succeeded" | "failed";
  mcqData: any | null;
  generateNotesStatus: "idle" | "loading" | "succeeded" | "failed";
  generateNotesData: any | null;
  personalTricksStatus: "idle" | "loading" | "succeeded" | "failed";
  personalTricksData: any | null;
  generateMindmapStatus: "idle" | "loading" | "succeeded" | "failed";
  generateMindmapData: any | null;
  error: string | null;

  transcriptForAllStatus: "idle" | "loading" | "succeeded" | "failed";
  transcriptForAllData: any | null;
}

const initialState: NotesState = {
  notes: [],
  selectedNote: null,
  status: "idle",
  transcriptionStatus: "idle",
  saveStatus: "idle",
  quizStatus: "idle",
  quizData: null,
  mcqStatus: "idle",
  mcqData: null,
  generateNotesStatus: "idle",
  generateNotesData: null,
  personalTricksStatus: "idle",
  personalTricksData: null,
  generateMindmapStatus: "idle",
  generateMindmapData: null,
  error: null,

  transcriptForAllStatus: "idle",
  transcriptForAllData: null,
};

// ------------------------------------------------
// Create transcription
// ------------------------------------------------
interface CreateTranscriptionPayload {
  page_number: number;
  file_url: string;
  document_id: string;
  user_id: string;
}

interface CreateTranscriptionResponse {
  status: string;
  page_number: number;
  file_url: string;
  transcription: string;
}

export const createTranscription = createAsyncThunk<
  CreateTranscriptionResponse,
  CreateTranscriptionPayload,
  { rejectValue: string }
>(
  "notes/createTranscription",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post<CreateTranscriptionResponse>(
        `${BASE_URL}/notes/transcribe`,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to create transcription"
      );
    }
  }
);

// ------------------------------------------------
// Save notes to backend
// ------------------------------------------------
interface SaveNotesPayload {
  document_id: string;
  notes: Array<{
    page: number;
    transcription: string;
    notes: string;
    quiz: { easy: string[], medium: string[], hard: string[] };
    mcq: {
      easy: Array<{ question: string, options: string[], answer: string }>;
      medium: Array<{ question: string, options: string[], answer: string }>;
      hard: Array<{ question: string, options: string[], answer: string }>;
    };
  }>;
}

interface SaveNotesResponse {
  status: string;
  message: string;
  saved_count: number;
}

export const saveNotes = createAsyncThunk<
  SaveNotesResponse,
  SaveNotesPayload,
  { rejectValue: string }
>(
  "notes/saveNotes",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post<SaveNotesResponse>(
        `${BASE_URL}/notes/save`,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to save notes"
      );
    }
  }
);

// ------------------------------------------------
// Fetch notes by document ID
// ------------------------------------------------
export const fetchNotesByDocument = createAsyncThunk<
  NoteItem[],
  { document_id: string },
  { rejectValue: string }
>(
  "notes/fetchByDocument",
  async ({ document_id }, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ notes: NoteItem[] }>(
        `${BASE_URL}/notes/document/${document_id}`
      );
      return response.data.notes;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to fetch notes"
      );
    }
  }
);

// ------------------------------------------------
// Fetch notes by user ID
// ------------------------------------------------
export const fetchNotesByUser = createAsyncThunk<
  NoteItem[],
  { user_id: string },
  { rejectValue: string }
>(
  "notes/fetchByUser",
  async ({ user_id }, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ notes: NoteItem[] }>(
        `${BASE_URL}/notes/user/${user_id}`
      );
      return response.data.notes;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to fetch notes"
      );
    }
  }
);

// ------------------------------------------------
// Generate Quiz
// ------------------------------------------------
interface GenerateQuizPayload {
  page_number: number;
  document_id: string;
  num_questions: number;
  transcription?: string;
}

interface GenerateQuizResponse {
  questions: any[];
}

export const generateQuiz = createAsyncThunk<
  GenerateQuizResponse,
  GenerateQuizPayload,
  { rejectValue: string }
>(
  "notes/generateQuiz",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post<GenerateQuizResponse>(
        `${BASE_URL}/notes/generate-questions`,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to generate quiz"
      );
    }
  }
);

// ------------------------------------------------
// Generate MCQ
// ------------------------------------------------
interface GenerateMCQPayload {
  page_number: number;
  document_id: string;
  num_questions: number;
  transcription?: string;
}

interface GenerateMCQResponse {
  mcq: any;
}

export const generateMCQ = createAsyncThunk<
  GenerateMCQResponse,
  GenerateMCQPayload,
  { rejectValue: string }
>(
  "notes/generateMCQ",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post<GenerateMCQResponse>(
        `${BASE_URL}/notes/generate-mcq`,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to generate MCQ"
      );
    }
  }
);

// ------------------------------------------------
// Generate Notes
// ------------------------------------------------
interface GenerateNotesPayload {
  page_number: number;
  document_id: string;
  transcription?: string;
}

interface GenerateNotesResponse {
  notes: any[];
}

export const generateNotes = createAsyncThunk<
  GenerateNotesResponse,
  GenerateNotesPayload,
  { rejectValue: string }
>(
  "notes/generateNotes",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post<GenerateNotesResponse>(
        `${BASE_URL}/notes/generate-notes`,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to generate notes"
      );
    }
  }
);




// ------------------------------------------------
// Create Personal tricks Notes
// ------------------------------------------------
interface CreatePersonalTricksPayload {
  page_number: number;
  document_id: string;
}

interface CreatePersonalTricksResponse {
  notes: any[];
}

export const createPersonalTricks = createAsyncThunk<
  CreatePersonalTricksResponse,
  CreatePersonalTricksPayload,
  { rejectValue: string }
>(
  "notes/createPersonalTricksNotes",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post<CreatePersonalTricksResponse>(
        `${BASE_URL}/notes/create-personal-tricks`,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to generate notes"
      );
    }
  }
);




// ------------------------------------------------
// Generate Mind Map
// ------------------------------------------------
interface GenerateMindmapPayload {
  page_number: number;
  document_id: string;
}

interface GenerateMindmapResponse {
  notes: any[];
}

export const generateMindmap = createAsyncThunk<
  GenerateMindmapResponse,
  GenerateMindmapPayload,
  { rejectValue: string }
>(
  "notes/generateMindmap",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post<GenerateMindmapResponse>(
        `${BASE_URL}/notes/generate-mind-map`,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to generate notes"
      );
    }
  }
);




// ------------------------------------------------
// Generate Transcript For All
// ------------------------------------------------
interface GenerateTranscriptForAllPayload {
  document_id: string;
}

interface GenerateTranscriptForAllResponse {
  notes: any[];
}

export const generateTranscriptForAll = createAsyncThunk<
  GenerateTranscriptForAllResponse,
  GenerateTranscriptForAllPayload,
  { rejectValue: string }
>(
  "notes/generateTranscriptForAll",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post<GenerateTranscriptForAllResponse>(
        `${BASE_URL}/notes/generate-transcript-for-all-pages`,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to generate transcript for all"
      );
    }
  }
);


// ------------------------------------------------
// Slice
// ------------------------------------------------
const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    clearNotes: (state) => {
      state.notes = [];
      state.error = null;
    },
    setSelectedNote: (state, action) => {
      state.selectedNote = action.payload;
    },
    clearSelectedNote: (state) => {
      state.selectedNote = null;
    },
  },
  extraReducers: (builder) => {
    // Create transcription
    builder
      .addCase(createTranscription.pending, (state) => {
        state.transcriptionStatus = "loading";
        state.error = null;
      })
      .addCase(createTranscription.fulfilled, (state, action) => {
        state.transcriptionStatus = "succeeded";
        // Convert response to NoteItem format for storage
        const noteItem: NoteItem = {
          id: `${action.payload.page_number}-${Date.now()}`, // Generate temporary ID
          page_number: action.payload.page_number,
          image_url: action.payload.file_url,
          document_id: '', // Not provided in response
          user_id: '', // Not provided in response
          transcription: action.payload.transcription,
          created_at: new Date().toISOString(),
        };
        state.notes.push(noteItem);
        state.selectedNote = noteItem;
      })
      .addCase(createTranscription.rejected, (state, action) => {
        state.transcriptionStatus = "failed";
        state.error = action.payload || "Failed to create transcription";
      });

    // Fetch notes by document
    builder
      .addCase(fetchNotesByDocument.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNotesByDocument.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notes = action.payload;
      })
      .addCase(fetchNotesByDocument.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch notes";
      });

    // Fetch notes by user
    builder
      .addCase(fetchNotesByUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNotesByUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notes = action.payload;
      })
      .addCase(fetchNotesByUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch notes";
      });

    // Save notes
    builder
      .addCase(saveNotes.pending, (state) => {
        state.saveStatus = "loading";
        state.error = null;
      })
      .addCase(saveNotes.fulfilled, (state) => {
        state.saveStatus = "succeeded";
      })
      .addCase(saveNotes.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.payload || "Failed to save notes";
      });

    // Generate Quiz
    builder
      .addCase(generateQuiz.pending, (state) => {
        state.quizStatus = "loading";
        state.error = null;
        state.quizData = null;
      })
      .addCase(generateQuiz.fulfilled, (state, action) => {
        state.quizStatus = "succeeded";
        state.quizData = action.payload;
      })
      .addCase(generateQuiz.rejected, (state, action) => {
        state.quizStatus = "failed";
        state.error = action.payload || "Failed to generate quiz";
      });

    // Generate MCQ
    builder
      .addCase(generateMCQ.pending, (state) => {
        state.mcqStatus = "loading";
        state.error = null;
        state.mcqData = null;
      })
      .addCase(generateMCQ.fulfilled, (state, action) => {
        state.mcqStatus = "succeeded";
        state.mcqData = action.payload;
      })
      .addCase(generateMCQ.rejected, (state, action) => {
        state.mcqStatus = "failed";
        state.error = action.payload || "Failed to generate MCQ";
      });

    // Generate Notes
    builder
      .addCase(generateNotes.pending, (state) => {
        state.generateNotesStatus = "loading";
        state.error = null;
        state.generateNotesData = null;
      })
      .addCase(generateNotes.fulfilled, (state, action) => {
        state.generateNotesStatus = "succeeded";
        state.generateNotesData = action.payload;
      })
      .addCase(generateNotes.rejected, (state, action) => {
        state.generateNotesStatus = "failed";
        state.error = action.payload || "Failed to generate notes";
      });

    // Create Personal Tricks Notes
    builder
      .addCase(createPersonalTricks.pending, (state) => {
        state.personalTricksStatus = "loading";
        state.error = null;
        state.personalTricksData = null;
      })
      .addCase(createPersonalTricks.fulfilled, (state, action) => {
        state.personalTricksStatus = "succeeded";
        state.personalTricksData = action.payload;
      })
      .addCase(createPersonalTricks.rejected, (state, action) => {
        state.personalTricksStatus = "failed";
        state.error = action.payload || "Failed to create personal tricks notes";
      })

      // Generate Mindmap
      .addCase(generateMindmap.pending, (state) => {
        state.generateMindmapStatus = "loading";
        state.error = null;
        state.generateMindmapData = null;
      })
      .addCase(generateMindmap.fulfilled, (state, action) => {
        state.generateMindmapStatus = "succeeded";
        state.generateMindmapData = action.payload;
      })
      .addCase(generateMindmap.rejected, (state, action) => {
        state.generateMindmapStatus = "failed";
        state.error = action.payload || "Failed to generate mindmap";
      })

      // Generate Transcript For All
      .addCase(generateTranscriptForAll.pending, (state) => {
        state.transcriptForAllStatus = "loading";
        state.error = null;
        state.transcriptForAllData = null;
      })
      .addCase(generateTranscriptForAll.fulfilled, (state, action) => {
        state.transcriptForAllStatus = "succeeded";
        state.transcriptForAllData = action.payload;
      })
      .addCase(generateTranscriptForAll.rejected, (state, action) => {
        state.transcriptForAllStatus = "failed";
        state.error = action.payload || "Failed to generate transcript for all";
      })
  },
});

export const { clearNotes, setSelectedNote, clearSelectedNote } = notesSlice.actions;
export default notesSlice.reducer;

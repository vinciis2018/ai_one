// ============================================
// documentsSlice.ts
// Redux slice for uploaded documents
// ============================================

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000"; // FastAPI backend

export interface DocumentItem {
  id: number;
  filename: string;
  source_type: string;
  created_at: string;
  content?: string; // Optional text content from backend (for preview)
  fileUrl: string; // URL to access the file from backend
}

interface DocumentsState {
  documents: DocumentItem[];
  selectedDocument: DocumentItem | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  selectedStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  selectedDocument: null,
  status: "idle",
  selectedStatus: "idle",
  error: null,
};

// ------------------------------------------------
// Fetch all documents
// ------------------------------------------------
export const fetchDocuments = createAsyncThunk<DocumentItem[], {user_id: string}, { rejectValue: string }>(
  "documents/fetchDocuments",
  async ({user_id}, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ documents: DocumentItem[] }>(`${BASE_URL}/upload/list?user_id=${user_id}`);
      return response.data.documents;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || "Failed to load documents");
    }
  }
);

// ------------------------------------------------
// Fetch single document by ID
// ------------------------------------------------
interface DocumentResponse {
  document: DocumentItem;
}

export const fetchDocumentById = createAsyncThunk<DocumentItem, number, { rejectValue: string }>(
  "documents/fetchDocumentById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get<DocumentResponse>(`${BASE_URL}/upload/${id}`);
      return response.data.document;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || "Failed to load document");
    }
  }
);

// ------------------------------------------------
// Slice Definition
// ------------------------------------------------
const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    clearSelectedDocument: (state) => {
      state.selectedDocument = null;
      state.selectedStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== Fetch All =====
      .addCase(fetchDocuments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch documents";
      })
      // ===== Fetch One =====
      .addCase(fetchDocumentById.pending, (state) => {
        state.selectedStatus = "loading";
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.selectedStatus = "succeeded";
        state.selectedDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.selectedStatus = "failed";
        state.error = action.payload || "Failed to fetch selected document";
      });
  },
});

export const { clearSelectedDocument } = documentsSlice.actions;
export default documentsSlice.reducer;

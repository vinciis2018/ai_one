// ============================================
// assistantSlice.ts
// Redux Toolkit slice for AI Assistant MVP
// Handles uploading docs and asking queries
// ============================================

import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// const BASE_URL = "http://127.0.0.1:8000"; // FastAPI backend
const BASE_URL = "https://ai.vinciis.in"; // FastAPI Prod backend

// -----------------------------
// Types
// -----------------------------

export interface UploadRequestPayload {
  fileName: string;
  s3Url: string;
  source_type: string;
  user_id: string;
  domain: string;
  subject?: string;
  type: string;
  file_type: string;
  file_size?: number;
}

export interface QueryResponse {
  query: string;
  answer: string;
  sources_used?: number;
  chat_id: string;
  conversation_id: string;
}

export interface UploadResponse {
  message: string;
  file_name?: string;

}

interface AssistantState {
  uploadStatus: "idle" | "loading" | "succeeded" | "failed";
  queryStatus: "idle" | "loading" | "succeeded" | "failed";
  response: QueryResponse | null;
  error: string | null;
}

// Initial state
const initialState: AssistantState = {
  uploadStatus: "idle",
  queryStatus: "idle",
  response: null,
  error: null,
};

// -----------------------------
// Thunks
// -----------------------------

export const uploadMaterial = createAsyncThunk<
  UploadResponse,
  // File,
  UploadRequestPayload,
  { rejectValue: string }
>("assistant/uploadMaterial", async (file, { rejectWithValue }) => {
  try {
    // const formData = new FormData();
    // formData.append("file", file);

    const response = await axios.post<UploadResponse>(
      `${BASE_URL}/upload/`,
      file,
      // {
      //   headers: { "Content-Type": "multipart/form-data" },
      // }
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as unknown as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      axiosError.response?.data?.message || "Failed to upload document"
    );
  }
});

export const askQuery = createAsyncThunk<
  QueryResponse,
  {text: string; userId: string, chatId: string; previousConversation: string, domain_expertise: string},
  { rejectValue: string }
>("assistant/askQuery", async ({text, userId, chatId, previousConversation, domain_expertise}, { rejectWithValue }) => {
  try {
    const response = await axios.post<QueryResponse>(`${BASE_URL}/query/`, {
      text,
      userId,
      chatId,
      previousConversation,
      domain_expertise,
    });
    console.log(response);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as unknown as { response?: { data?: { message?: string } } };

    return rejectWithValue(
      axiosError.response?.data?.message || "Failed to get assistant response"
    );
  }
});

// -----------------------------
// Slice
// -----------------------------

const assistantSlice = createSlice({
  name: "assistant",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.uploadStatus = "idle";
      state.queryStatus = "idle";
      state.error = null;
      state.response = null;
    },
  },
  extraReducers: (builder) => {
    // Upload material
    builder
      .addCase(uploadMaterial.pending, (state) => {
        state.uploadStatus = "loading";
      })
      .addCase(uploadMaterial.fulfilled, (state) => {
        state.uploadStatus = "succeeded";
      })
      .addCase(uploadMaterial.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.error = action.payload || "Upload failed";
      });

    // Ask query
    builder
      .addCase(askQuery.pending, (state) => {
        state.queryStatus = "loading";
      })
      .addCase(askQuery.fulfilled, (state, action: PayloadAction<QueryResponse>) => {
        state.queryStatus = "succeeded";
        state.response = action.payload;
      })
      .addCase(askQuery.rejected, (state, action) => {
        state.queryStatus = "failed";
        state.error = action.payload || "Query failed";
      });
  },
});

// Export actions and reducer
export const { resetStatus } = assistantSlice.actions;
export default assistantSlice.reducer;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
const BASE_URL = "http://127.0.0.1:8000"; // FastAPI backend


export interface Conversation {
  id: number;
  query: string;
  answer: string;
  created_at: string;
}

interface ConversationState {
  items: Conversation[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  search: string;
  page: number;
  limit: number;
  hasMore: boolean;
  selectedConversation: Conversation | null;
}

const initialState: ConversationState = {
  items: [],
  status: 'idle',
  error: null,
  search: '',
  page: 1,
  limit: 10,
  hasMore: true,
  selectedConversation: null,
};

export const fetchConversations = createAsyncThunk<
  { conversations: Conversation[]; count: number },
  { page?: number; limit?: number; search?: string } | undefined,
  { rejectValue: string }
>(
  'conversations/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '' } = params;
      const skip = (page - 1) * limit;
      const response = await axios.get<{ conversations: Conversation[]; count: number }>(`${BASE_URL}/conversations`, {
        params: { skip, limit, search },
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load conversations');
    }
  }
);

const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    clearConversations: (state) => {
      state.items = [];
      state.page = 1;
      state.hasMore = true;
    },
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const newItems = action.payload.conversations || [];
        if (state.page === 1) {
          state.items = newItems;
        } else {
          state.items = [...state.items, ...newItems];
        }
        state.hasMore = newItems.length >= state.limit;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Error loading conversations';
      });
  },
});

export const { setSearch, clearConversations, setSelectedConversation } = conversationSlice.actions;
export default conversationSlice.reducer;

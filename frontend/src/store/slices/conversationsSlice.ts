import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
const BASE_URL = "http://127.0.0.1:8000"; // FastAPI backend


export interface Conversation {
  id: number;
  query: string;
  query_by: string;
  answer: string;
  answer_by: string;
  sources_used: number;

  previous_conversation: string;
  parent_conversation: string;
  chat_id: string;
  created_at: string;
}

export interface ChatResponse {
  id: number;
  created_at: string;
  conversations: Conversation[];
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
  chat: ChatResponse | null;
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
  chat: null,
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

export const fetchChatById = createAsyncThunk<ChatResponse, string, { rejectValue: string }>(
  'conversations/fetchChatById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get<ChatResponse>(`${BASE_URL}/conversations/chat/${id}`);
      console.log(response.data)
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load conversation');
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
      })
      .addCase(fetchChatById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChatById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.chat = action.payload;
      })
      .addCase(fetchChatById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Error loading conversation';
      });
  },
});

export const { setSearch, clearConversations, setSelectedConversation } = conversationSlice.actions;
export default conversationSlice.reducer;

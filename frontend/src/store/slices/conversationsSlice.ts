import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../constants/helperConstants';
// const BASE_URL = "http://127.0.0.1:8000"; // FastAPI backend
// const BASE_URL = "https://ai.vinciis.in"; // FastAPI backend


export interface Conversation {
  id: string;
  query: string;
  query_by: string;
  answer: string;
  answer_by: string;
  sources_used?: string[];
  prev_conversation: string | null;
  conversation_id: string;
  parent_conversation: string;
  created_at: string;
  user_id?: string;
  attached_media?: string;
  media_transcript?: string;
}

export interface ChatResponse {
  id: string;
  _id?: string;
  title: string;
  created_at: string;
  conversations: Conversation[];
  student_id?: string;
  teacher_id?: string;
  user_id?: string;
}
interface ConversationState {
  items: Conversation[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  search: string;
  page: number;
  limit: number;
  hasMore: boolean;
  selectedChat: ChatResponse | null;
  chat: ChatResponse | null;
  chats: ChatResponse[];
}

const initialState: ConversationState = {
  items: [],
  status: 'idle',
  error: null,
  search: '',
  page: 1,
  limit: 10,
  hasMore: true,
  selectedChat: null,
  chat: null,
  chats: [],
};

export const fetchConversations = createAsyncThunk<
  { conversations: Conversation[]; count: number },
  { page?: number; limit?: number; search?: string, chat_id?: string } | undefined,
  { rejectValue: string }
>(
  'conversations/fetchAllConversations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 100, search = '', chat_id } = params;
      const skip = (page - 1) * limit;
      const response = await axios.get<{ conversations: Conversation[]; count: number }>(`${BASE_URL}/conversations`, {
        params: { skip, limit, search, chat_id },
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load conversations');
    }
  }
);

export const fetchChats = createAsyncThunk<
  { chats: ChatResponse[]; count: number },
  { page?: number; limit?: number; search?: string, user_id?: string } | undefined,
  { rejectValue: string }
>(
  'conversations/fetchAllChats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 100, search = '', user_id } = params;
      const skip = (page - 1) * limit;
      const response = await axios.get<{ chats: ChatResponse[]; count: number }>(`${BASE_URL}/conversations/chats`, {
        params: { skip, limit, search, user_id },
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as unknown as { response?: { data?: { detail?: string } } };
      return rejectWithValue(axiosError.response?.data?.detail || 'Failed to load conversations');
    }
  }
);


export const fetchTeacherStudentChats = createAsyncThunk<
  { chats: ChatResponse[]; count: number },
  { page?: number; limit?: number; search?: string, user_id?: string, student_id?: string, teacher_id?: string } | undefined,
  { rejectValue: string }
>(
  'conversations/fetchAllTeacherStudentChats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 100, search = '', user_id, student_id, teacher_id } = params;
      const skip = (page - 1) * limit;
      const response = await axios.get<{ chats: ChatResponse[]; count: number }>(`${BASE_URL}/conversations/chats/teacher/student`, {
        params: { skip, limit, search, user_id, student_id, teacher_id },
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
      state.chat = null;
      state.page = 1;
      state.hasMore = true;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
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
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Error loading conversations';
      })
      .addCase(fetchChats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const newChats = action.payload.chats || [];
        if (state.page === 1) {
          state.chats = newChats;
        } else {
          state.chats = [...state.chats, ...newChats];
        }
        state.hasMore = newChats.length >= state.limit;
        state.error = null;

      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Error loading conversations';
      })

      .addCase(fetchTeacherStudentChats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTeacherStudentChats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const newChats = action.payload.chats || [];
        if (state.page === 1) {
          state.chats = newChats;
        } else {
          state.chats = [...state.chats, ...newChats];
        }
        state.hasMore = newChats.length >= state.limit;
        state.error = null;
      })
      .addCase(fetchTeacherStudentChats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Error loading conversations';
      })

      .addCase(fetchChatById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChatById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.chat = action.payload;
        state.error = null;
      })
      .addCase(fetchChatById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Error loading conversation';
      });
  },
});

export const { setSearch, clearConversations, setSelectedChat } = conversationSlice.actions;
export default conversationSlice.reducer;

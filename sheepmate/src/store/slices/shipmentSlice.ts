import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../constants/helperConstants';

interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
}

interface Email {
  id: string;
  subject: string;
  sender: string;
  date: string;
  attachments: Attachment[];
}

interface ShipmentState {
  emails: Email[];
  loading: boolean;
  error: string | null;
  downloadingAttachment: string | null; // ID of attachment currently downloading
  convertingAttachment: string | null; // ID of attachment currently converting
}

const initialState: ShipmentState = {
  emails: [],
  loading: false,
  error: null,
  downloadingAttachment: null,
  convertingAttachment: null,
};

export const fetchEmailsByDate = createAsyncThunk<Email[], string>(
  'shipment/fetchEmailsByDate',
  async (date, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('google_access_token');
      if (!token) {
        return rejectWithValue('Login again');
      }
      const response = await axios.post<{ emails: Email[] }>(`${BASE_URL}/sheepmate/get-emails`, { date, token });
      return response.data.emails;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch emails');
    }
  }
);

export const downloadAttachment = createAsyncThunk<void, { messageId: string; attachmentId: string; filename: string }>(
  'shipment/downloadAttachment',
  async ({ messageId, attachmentId, filename }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('google_access_token');
      if (!token) throw new Error('No token found');

      const response = await axios.post(
        `${BASE_URL}/sheepmate/email/get-attachment`,
        {
          token,
          message_id: messageId,
          attachment_id: attachmentId
        },
        { responseType: 'blob' }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download failed:', error);
      return rejectWithValue('Failed to download');
    }
  }
);

export const convertPdfToExcel = createAsyncThunk<void, { messageId: string; attachmentId: string; filename: string }>(
  'shipment/convertPdfToExcel',
  async ({ messageId, attachmentId, filename }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('google_access_token');
      if (!token) throw new Error('No token found');

      const response = await axios.post(
        `${BASE_URL}/sheepmate/pdf-to-excel`,
        {
          token,
          message_id: messageId,
          attachment_id: attachmentId
        },
        { responseType: 'blob' }
      );

      // Create blob link to download
      const excelFilename = filename.replace(/\.pdf$/i, '.xlsx');
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', excelFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Conversion failed:', error);
      return rejectWithValue('Failed to convert PDF to Excel');
    }
  }
);

const shipmentSlice = createSlice({
  name: 'shipment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmailsByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmailsByDate.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.emails = payload;
      })
      .addCase(fetchEmailsByDate.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(downloadAttachment.pending, (state, action) => {
        state.downloadingAttachment = action.meta.arg.attachmentId;
      })
      .addCase(downloadAttachment.fulfilled, (state) => {
        state.downloadingAttachment = null;
      })
      .addCase(downloadAttachment.rejected, (state) => {
        state.downloadingAttachment = null;
      })
      .addCase(convertPdfToExcel.pending, (state, action) => {
        state.convertingAttachment = action.meta.arg.attachmentId;
      })
      .addCase(convertPdfToExcel.fulfilled, (state) => {
        state.convertingAttachment = null;
      })
      .addCase(convertPdfToExcel.rejected, (state) => {
        state.convertingAttachment = null;
      });
  },
});

export default shipmentSlice.reducer;

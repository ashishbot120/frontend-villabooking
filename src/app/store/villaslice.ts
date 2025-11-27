// app/store/villaslice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axiosInstance'; // <-- FIX 1: Use axios instance
import { Villa } from '@/types';
import type { RootState } from './store'; // ← Import RootState
import { isAxiosError } from 'axios'; // <-- FIX 3: Import type guard

interface VillaState {
  villas: Villa[];
  loading: boolean;
  error: string | null;
}

const initialState: VillaState = {
  villas: [],
  loading: false,
  error: null,
};

interface SearchParams {
  location?: string;
  guests?: number;
  date?: string;
}

export const fetchVillas = createAsyncThunk(
  'villas/fetchVillas',
  async (params: SearchParams, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.location) query.append('location', params.location);
      if (params.guests !== undefined) query.append('guests', params.guests.toString());
      if (params.date) query.append('date', params.date);

      const response = await api.get(`/villas?${query.toString()}`);
      return response.data as Villa[];
    } catch (error: unknown) { // <-- 2. FIXED
      let message = 'Failed to fetch villas';
      if (isAxiosError(error)) { // <-- 3. ADDED TYPE GUARD
          message = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
          message = error.message;
      }
      return rejectWithValue(message);
    }
  }
);

const villaSlice = createSlice({
  name: 'villas',
  initialState,
  reducers: {
    clearVillas: (state) => {
      state.villas = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVillas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVillas.fulfilled, (state, action: PayloadAction<Villa[]>) => {
        state.loading = false;
        state.villas = action.payload;
      })
      .addCase(fetchVillas.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'An unexpected error occurred';
      });
  },
});

export const { clearVillas } = villaSlice.actions;

// === SELECTORS (use RootState) ===
export const selectVillas = (state: RootState) => state.villas.villas;
export const selectVillaLoading = (state: RootState) => state.villas.loading;
export const selectVillaError = (state: RootState) => state.villas.error;

export default villaSlice.reducer;
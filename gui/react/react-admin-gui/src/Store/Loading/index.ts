import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '..';

export interface LoadingState {
  loading: boolean | string;
}

const initialState: LoadingState = {
  loading: true
};

export const loadingSlice = createSlice({
  name: 'counter',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setLoaded: (state) => {
      state.loading = false;
    }
  }
});

export const { setLoaded } = loadingSlice.actions;
export const getLoadingStatus = (state: RootState) => state.loading.loading;

export default loadingSlice.reducer;

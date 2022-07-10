import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '../../Store';

export interface LoadingState {
  loading: boolean | string;
}

const initialState: LoadingState = {
  loading: true
};

export const loadingSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    setLoaded: (state) => {
      state.loading = false;
    }
  }
});

export const { setLoaded } = loadingSlice.actions;
export const getLoadingStatus = (state: RootState) => state.loading.loading;

export default loadingSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface LoadingState {
  loaded: boolean;
}

const initialState: LoadingState = {
  loaded: false
};

export const loadingSlice = createSlice({
  name: 'counter',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setLoaded: (state) => {
      state.loaded = true;
    }
  }
});

export const { setLoaded } = loadingSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectLoaded = (state: RootState) => state.loading.loaded;

export default loadingSlice.reducer;

import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import loadingReducer from '../Features/LoadingWrapper/loadingSlice';
import guiReducer from '../Features/GUI/guiSlice';

export const store = configureStore({
  reducer: {
    loading: loadingReducer,
    gui: guiReducer
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

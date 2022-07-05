import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import loadingReducer from './Loading';

export const store = configureStore({
  reducer: {
    loading: loadingReducer
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

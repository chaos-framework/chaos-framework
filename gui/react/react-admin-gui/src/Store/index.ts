import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import loadingReducer from './Loading';
import navigationReducer from './Navigation';

export const store = configureStore({
  reducer: {
    loading: loadingReducer,
    navigation: navigationReducer
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

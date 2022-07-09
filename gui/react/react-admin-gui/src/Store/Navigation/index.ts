import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../index.js';

export type PageType = 'admin' | 'game' | 'entity' | 'entityList';
export type WindowPosition = 'minimized' | 'left' | 'right' | 'floating';

export interface WindowHistoryPlace {
  name: string;
  pageType: PageType;
  props: any;
}

export interface Window {
  position: WindowPosition;
  currentPlaceInHistory: WindowHistoryPlace;
  history: WindowHistoryPlace[];
}

export interface NavigationState {
  mainWindow: Window;
}

const startingWindowHistoryPlace: WindowHistoryPlace = {
  name: 'All Entities',
  pageType: 'entityList',
  props: {}
};

const initialState: NavigationState = {
  mainWindow: {
    currentPlaceInHistory: startingWindowHistoryPlace,
    history: [startingWindowHistoryPlace],
    position: 'left'
  }
};

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    pushToWindow
  }
});

export const getMainWindow = (state: RootState) => state.navigation.mainWindow;

export default navigationSlice.reducer;

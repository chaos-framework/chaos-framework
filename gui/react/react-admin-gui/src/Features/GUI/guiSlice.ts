import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import DockLayout from 'rc-dock';

import { RootState } from '../../Store/index.js';

export type PageType = 'admin' | 'game' | 'entity' | 'entityList';
export type WindowPosition = 'minimized' | 'left' | 'right' | 'floating';

interface GUIState {
  dockRef?: DockLayout;
}

const initialState = {
  dockRef: DockLayout
};

export const guiSlice = createSlice({
  name: 'gui',
  initialState,
  reducers: {}
});

export default guiSlice.reducer;

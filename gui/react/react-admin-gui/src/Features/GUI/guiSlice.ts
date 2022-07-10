import { createSlice } from '@reduxjs/toolkit';

import { IJsonModel } from 'flexlayout-react';

import { RootState } from '../../Store/index.js';

export type PageType = 'admin' | 'game' | 'entity' | 'entityList';
export type WindowPosition = 'minimized' | 'left' | 'right' | 'floating';

const initialState = {
  // TODO theme, etc
};

export const guiSlice = createSlice({
  name: 'gui',
  initialState,
  reducers: {}
});

export default guiSlice.reducer;

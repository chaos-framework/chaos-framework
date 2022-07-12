import React, { FC, useEffect, useRef } from 'react';

import DockLayout from 'rc-dock';

import defaultLayout from './defaultLayout.js';
import 'rc-dock/dist/rc-dock-dark.css';

import Navbar from './Navbar/Navbar.js';

import './GUI.scss';
import { useAppDispatch } from '../../Store/hooks.js';
import { setDockRef } from './guiSlice.js';

const useEffectOnce = (effect: any) => {
  useEffect(effect, []);
};

const useMount = (fn: () => any) => {
  useEffectOnce(() => {
    fn();
  });
};

const GUI: FC<any> = (props: any) => {
  const dockRef = useRef(null);
  const dispatch = useAppDispatch();
  useMount(() => {
    if (!dockRef.current) {
      return;
    }
    console.log('Setting dockRef.');
    dispatch(setDockRef(dockRef.current));
  });

  return (
    <div className="GUI">
      <Navbar dock={dockRef} />
      <DockLayout ref={dockRef} style={{ height: '100%', width: '100%' }} defaultLayout={defaultLayout} />;
    </div>
  );
};

export default GUI;

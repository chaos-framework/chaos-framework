import React, { FC, useEffect, useRef, useState } from 'react';

import DockLayout from 'rc-dock';

import Navbar from './Navbar/Navbar.js';
import defaultLayout from './defaultLayout.js';

import 'rc-dock/dist/rc-dock-dark.css';
import './GUI.scss';

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
  const [dockState, updateDockRefState] = useState(undefined);

  useMount(() => {
    if (!dockRef?.current) {
      return;
    }
    updateDockRefState(dockRef.current);
  });

  return (
    <div className="GUI">
      <Navbar dock={dockState} />
      <DockLayout ref={dockRef} style={{ height: '100%', width: '100%' }} defaultLayout={defaultLayout} />
    </div>
  );
};

export default GUI;

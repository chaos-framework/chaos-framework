import { Spinner } from '@blueprintjs/core';
import { useState } from 'react';

import './App.scss';
import Navbar from './Components/Structure/Navbar';
import Renderer from './Components/Renderer';
import { Window } from './Components/Structure/Window/Window.js';

import { useAppSelector } from './Store/hooks.js';
import { getLoadingStatus } from './Store/Loading';
import { getMainWindow } from './Store/Navigation/index.js';

function App() {
  const loadingStatus = useAppSelector(getLoadingStatus);
  const mainWindow = useAppSelector(getMainWindow);

  if (loadingStatus === true) {
    return <Spinner />;
  } else if (typeof loadingStatus === 'string') {
    return <span>Error: {loadingStatus}</span>;
  } else {
    return (
      <div className="bp4-dark">
        <Navbar />
        <div className="container">
          {/* Render the main admin window */}
          <Window {...mainWindow} />
          <Renderer />
        </div>
      </div>
    );
  }
}

export default App;

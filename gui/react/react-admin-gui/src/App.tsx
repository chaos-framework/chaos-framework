import { Spinner } from '@blueprintjs/core';
import { useState } from 'react';

import './App.scss';
import EntityList from './Components/Entities/EntityTable/EntityTable.js';
import Navbar from './Components/Structure/Navbar';
import Renderer from './Components/Renderer';
import { Sidebar } from './Components/Structure/Sidebar/Sidebar.js';

import { useAppSelector } from './Store/hooks.js';
import { getLoadingStatus } from './Store/Loading';

function App() {
  const loadingStatus = useAppSelector(getLoadingStatus);

  if (loadingStatus === true) {
    return <Spinner />;
  } else if (typeof loadingStatus === 'string') {
    return <span>Error: {loadingStatus} </span>;
  } else {
    return (
      <div className="bp4-dark">
        <Navbar />
        <div className="container">
          <Sidebar>
            <EntityList />
          </Sidebar>
          <Renderer />
        </div>
      </div>
    );
  }
}

export default App;

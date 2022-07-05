// React essentials
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

//  Polyfill for node's buffer class
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Chaos essentials
const { AdminClient } = await import('@chaos-framework/socket-io');
import { ChaosProvider } from '@chaos-framework/react-lib';
import { QueryAPI } from '@chaos-framework/api';

// Local store
import { store } from './Store/';
import { setLoaded } from './Store/Loading/index.js';

// App imports
import App from './App';
import './index.css';

// Connect to the local server
const client = new AdminClient('localhost:1980', 'Admin', undefined);
client.connectionCallback = (err?: string) => {
  store.dispatch(setLoaded());
};
client.connect('');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChaosProvider value={new QueryAPI()}>
      <Provider store={store}>
        <App />
      </Provider>
    </ChaosProvider>
  </React.StrictMode>
);

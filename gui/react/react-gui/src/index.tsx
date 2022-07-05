import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import { IOClient } from '@chaos-framework/socket-io';
import { QueryAPI } from '@chaos-framework/api';
import { ChaosProvider } from '@chaos-framework/react-lib';
import Loading from './features/loading/loading';
import { setLoaded } from './features/loading/loadingSlice';

import 'bootstrap/dist/css/bootstrap.min.css';

const client = new IOClient('localhost:1980', 'Test User', undefined);
client.connectionCallback = (err?: string) => {
  store.dispatch(setLoaded());
};
client.connect('');

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ChaosProvider value={new QueryAPI()}>
        <Loading>
          <App />
        </Loading>
      </ChaosProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

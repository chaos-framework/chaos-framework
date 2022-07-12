import LoadingWrapper from './Features/LoadingWrapper/LoadingWrapper.js';
import GUI from './Features/GUI/GUI.js';

import './App.scss';

function App() {
  return (
    <div className="container bp4-dark">
      <LoadingWrapper>
        <div className="container">
          <GUI />
        </div>
      </LoadingWrapper>
    </div>
  );
}

export default App;

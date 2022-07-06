import { FC } from 'react';
import { Navbar, Alignment, Button } from '@blueprintjs/core';
import { useChaos, useChaosAPI } from '@chaos-framework/react-lib';

const LoadingScreen: FC = () => {
  return (
    <div>
      {query.map(([key, subquery]: any) => (
        <div key={key}>an entity exists! </div>
      ))}
      {'' + entities.size}
    </div>
  );
};

export default LoadingScreen;

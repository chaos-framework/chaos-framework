import { FC } from 'react';
import { useAppSelector } from '../../Store/hooks.js';

import { Spinner } from '@blueprintjs/core';

import { getLoadingStatus } from './loadingSlice';

interface LoadingProps {
  children: JSX.Element | JSX.Element[];
}

// Stops the page from displaying util the app has connected to and fully sync'd with the Chaos server
const LoadingWrapper: FC<LoadingProps> = (props: LoadingProps) => {
  const loadingStatus = useAppSelector(getLoadingStatus);
  if (loadingStatus === true) {
    return <Spinner />;
  } else if (typeof loadingStatus === 'string') {
    return <span>{loadingStatus}</span>;
  } else {
    return props.children;
  }
};

export default LoadingWrapper;

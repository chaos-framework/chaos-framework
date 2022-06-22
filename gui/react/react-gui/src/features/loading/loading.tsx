import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectLoaded } from './loadingSlice';

const Loading = (props: any) => {
  const loaded = useAppSelector(selectLoaded);
  return <div>{loaded ? props.children : 'Loading'}</div>;
};

export default Loading;

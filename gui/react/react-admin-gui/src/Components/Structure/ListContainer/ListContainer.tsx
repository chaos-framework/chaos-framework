import { FC, ReactNode } from 'react';
import { Navbar, Alignment, Button } from '@blueprintjs/core';
import { useChaos, useChaosAPI } from '@chaos-framework/react-lib';

import './List.scss';

type ListContainerProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode | ReactNode[];
};

const ListContainer: FC<ListContainerProps> = (props: ListContainerProps) => {
  return (
    <div className="List">
      <span className="List-Header">{props.title}</span>
      {props.children}
    </div>
  );
};

export default ListContainer;

import { FC } from 'react';
import './Sidebar.scss';

type SidebarProps = {
  children?: JSX.Element[];
};

export const Sidebar: FC = (props: SidebarProps) => {
  return <div className="Sidebar">{props.children}</div>;
};

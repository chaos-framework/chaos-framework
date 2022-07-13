import { DockContextType, TabData } from 'rc-dock';
import { FC, useContext } from 'react';
import './Tab.scss';

interface TabProps {
  id: string;
  children: JSX.Element | JSX.Element[];
  // TODO context?
}

const Tab: FC<TabProps> = (props: TabProps) => {
  return <div className="Tab">{props.children}</div>;
};

export default Tab;

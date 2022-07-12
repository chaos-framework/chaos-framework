import { FC } from 'react';
import './Tab.scss';

interface TabProps {
  children: JSX.Element | JSX.Element[];
}

const Tab: FC<TabProps> = (props: TabProps) => {
  return <div className="Tab">{props.children}</div>;
};

export default Tab;

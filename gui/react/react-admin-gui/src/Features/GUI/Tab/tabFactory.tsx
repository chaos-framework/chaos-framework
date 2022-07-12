import {} from 'react';
import { PageType } from '../guiSlice.js';
import EntityList from '../../../Components/Entities/EntityTable/EntityTable.js';
import Tab from './Tab.js';
import { TabData } from 'rc-dock';

export const entityListTabFactory = (searchParams?: any): TabData => {
  return {
    title: 'All Entities',
    content: (
      <Tab>
        <EntityList />
      </Tab>
    )
  };
};

import {} from 'react';
import EntityList from '../../../Components/Entities/EntityTable/EntityTable.js';
import Tab from './Tab.js';
import { TabData } from 'rc-dock';
import { uniqueId } from '@blueprintjs/core/lib/esm/common/utils/jsUtils.js';

export const entityListTabFactory = (searchParams?: any): TabData => {
  return {
    id: uniqueId('gui'),
    title: 'All Entities',
    content: (
      <Tab>
        <EntityList />
      </Tab>
    ),
    closable: true
  };
};

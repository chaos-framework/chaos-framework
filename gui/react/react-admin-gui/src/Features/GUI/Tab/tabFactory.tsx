import {} from 'react';
import EntityList from '../../../Components/Entities/EntityTable/EntityTable.js';
import Tab from './Tab.js';
import { TabData } from 'rc-dock';
import { uniqueId } from '@blueprintjs/core/lib/esm/common/utils/jsUtils.js';
import { EntityQuery } from '@chaos-framework/api';
import EntityInspector from '../../../Components/Entities/EntityInspector/EntityInspector.js';

export const entityListTabFactory = (searchParams?: any): TabData => {
  const id = uniqueId('gui');
  return {
    id,
    title: 'All Entities',
    content: (
      <Tab id={id}>
        <EntityList tabId={id} />
      </Tab>
    ),
    closable: true
  };
};

export const entityInspectorTabFactory = (entityQuery: EntityQuery): TabData => {
  const id = uniqueId('gui');
  return {
    id,
    title: entityQuery.value.name,
    content: (
      <Tab id={id}>
        <EntityInspector query={entityQuery} />
      </Tab>
    ),
    closable: true
  };
};

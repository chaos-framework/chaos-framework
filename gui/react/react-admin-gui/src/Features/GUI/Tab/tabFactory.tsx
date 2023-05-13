import {} from 'react';
import EntityList from '../../Entities/EntityList/EntityList.js';
import Tab from './Tab.js';
import { TabData } from 'rc-dock';
import { uniqueId } from '@blueprintjs/core/lib/esm/common/utils/jsUtils.js';
import { ComponentQuery, EntityQuery } from '@chaos-framework/api';
import EntityInspector from '../../Entities/EntityInspector/EntityInspector.js';
import Renderer from '../../Renderer/index.js';
import ComponentInspector from '../../Components/ComponentInspector/ComponentInspector.js';

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

export const componentInspectorTabFactory = (componentQuery: ComponentQuery): TabData => {
  const id = uniqueId('gui');
  return {
    id,
    title: componentQuery.value.name,
    content: (
      <Tab id={id}>
        <ComponentInspector query={componentQuery} />
      </Tab>
    ),
    closable: true
  };
};

export const rendererTabFactory = (entityQuery: EntityQuery): TabData => {
  const id = uniqueId('gui');
  return {
    id,
    title: entityQuery.value.name,
    content: (
      <Tab id={id}>
        <Renderer />
      </Tab>
    ),
    closable: true
  };
};

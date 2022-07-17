import { FC, useContext } from 'react';
import { useChaos, useChaosAPI } from '@chaos-framework/react-lib';
import { CollectionQuery, EntityQuery, Query } from '@chaos-framework/api';
import { Entity } from '@chaos-framework/core';
import { DockContextType } from 'rc-dock';
import { entityInspectorTabFactory } from '../../GUI/Tab/tabFactory.js';
import Table, { BaseTableProps, ColumnDefinition } from '../../../Components/Table/Table.js';

interface EntityListProps extends BaseTableProps {
  tabId?: string;
  data?: CollectionQuery<Entity, EntityQuery>;
}

const EntityList: FC<EntityListProps> = (props: EntityListProps) => {
  const api = useChaosAPI();
  const context = useContext(DockContextType);
  const [, query] = useChaos(props.data || api.entities());
  const columnDefinition: ColumnDefinition[] = [
    {
      key: 'link',
      name: '',
      link: true,
      width: 110
    },
    {
      key: 'id',
      name: 'id',
      formatter: (s: string) => s.slice(s.length - 9, s.length - 1)
    },
    {
      key: 'name',
      name: 'Name'
    }
    //  {
    //     key: 'worldName',
    //     name: 'World Name'
    //   }
  ];
  return (
    <Table
      tabId={props.tabId}
      columns={columnDefinition}
      collectionQuery={query}
      tabFactory={entityInspectorTabFactory}
    />
  );
};

export default EntityList;

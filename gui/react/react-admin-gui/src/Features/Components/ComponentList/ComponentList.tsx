import { FC, useContext } from 'react';
import { useChaos, useChaosAPI } from '@chaos-framework/react-lib';
import { CollectionQuery, ComponentQuery } from '@chaos-framework/api';
import { Component } from '@chaos-framework/core';
import { DockContextType } from 'rc-dock';
import { entityInspectorTabFactory } from '../../GUI/Tab/tabFactory.js';
import Table, { BaseTableProps, ColumnDefinition } from '../../../Components/Table/Table.js';

interface ComponentListProps extends BaseTableProps {
  tabId?: string;
  data: CollectionQuery<Component, ComponentQuery>;
}

const ComponentList: FC<ComponentListProps> = (props: ComponentListProps) => {
  const api = useChaosAPI();
  const context = useContext(DockContextType);
  const [, query] = useChaos(props.data);
  const columnDefinition: ColumnDefinition[] = [
    {
      key: 'link',
      name: '',
      link: true,
      width: 80
    },
    {
      key: 'id',
      name: 'id',
      formatter: (s: string) => s.slice(s.length - 9, s.length - 1),
      width: 100
    },
    {
      key: 'name',
      name: 'Name',
      width: 400
    }
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

export default ComponentList;

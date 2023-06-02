import { FC, useContext } from 'react';
import { useChaos, useChaosAPI } from '@chaos-framework/react-lib';
import { CollectionQuery, PropertyQuery } from '@chaos-framework/api';
import { Property } from '@chaos-framework/core';
import { DockContextType } from 'rc-dock';
import { componentInspectorTabFactory } from '../../GUI/Tab/tabFactory.js';
import Table, { BaseTableProps, ColumnDefinition } from '../../../Components/Table/Table.js';

interface PropertyListProps extends BaseTableProps {
  tabId?: string;
  data: CollectionQuery<Property, PropertyQuery>;
}

const formatter = (val: string) => {
  try {
    const asNum = parseFloat(val);
    if (asNum == Number.MIN_VALUE || asNum == Number.MIN_SAFE_INTEGER) {
      return `-∞`
    }
    if (asNum == Number.MAX_VALUE || asNum == Number.MAX_SAFE_INTEGER) {
      return `∞`
    }
    return val;
  } catch (err) {
    return 'NaN';
  }
}

const PropertyList: FC<PropertyListProps> = (props: PropertyListProps) => {
  const api = useChaosAPI();
  const context = useContext(DockContextType);
  const [, query] = useChaos(props.data);
  const columnDefinition: ColumnDefinition[] = [
    // {
    //   key: 'link',
    //   name: '',
    //   link: true,
    //   width: 80
    // },
    {
      key: 'name',
      name: 'Name',
      width: 200
    },
    {
      key: 'min',
      name: 'Min',
      width: 50,
      formatter
    },
    {
      key: 'current',
      name: 'Curr',
      width: 50,
      formatter
    },
    {
      key: 'max',
      name: 'Max',
      width: 50,
      formatter
    }
  ];
  return (
    <Table
      tabId={props.tabId}
      columns={columnDefinition}
      collectionQuery={query}
      // tabFactory={componentInspectorTabFactory}
    />
  );
};

export default PropertyList;

import { useContext, useState } from 'react';
import { Table2, Column } from '@blueprintjs/table';
import { useChaos, useChaosAPI } from '@chaos-framework/react-lib';
import { CollectionQuery, EntityQuery, IndividualQuery, Query } from '@chaos-framework/api';
import { PaginatedChaosCollection } from '../../Util/Pagination.js';
import { DockContextType, TabData } from 'rc-dock';
import {
  DefaultExternalCellRenderer,
  ExternalCellRenderer,
  DefaultExternalHeaderCellRenderer,
  LinkCellRenderer
} from './CellRenderers.js';

export type ColumnDefinition = {
  key: string;
  name: string;
  cellRenderer?: ExternalCellRenderer;
  formatter?: (value: string) => string;
  width?: number;
  link?: boolean;
};

type GenericCollectionQuery<T = any, C = IndividualQuery<T>> = CollectionQuery<T, C>;

export interface BaseTableProps {
  tabId?: string;
  pageLength?: number;
}

export interface TableProps<T extends GenericCollectionQuery> extends BaseTableProps {
  data: T;
  columns: ColumnDefinition[];
  tabFactory?: (...props: any) => TabData;
}

const Table = <T extends GenericCollectionQuery>(props: TableProps<T>) => {
  const context = useContext(DockContextType);
  const [pageNumber] = useState(0);
  const [pageLength] = useState(props.pageLength || 20);
  const pagination = new PaginatedChaosCollection(props.data);
  const paginatedEntries: IndividualQuery<any>[] = pagination.getPage(pageNumber, pageLength);
  const actualPageLength = paginatedEntries.length;

  const columns = props.columns.map((definition) => {
    const renderer = definition.link
      ? LinkCellRenderer(
          paginatedEntries,
          (arg: any) => {
            context.dockMove(props.tabFactory!(arg), props.tabId!, 'update');
          },
          (arg: any) => {
            context.dockMove(props.tabFactory!(arg), props.tabId!, 'after-tab');
          }
        )
      : DefaultExternalCellRenderer(paginatedEntries, definition.key, definition.formatter);
    return (
      <Column
        key={definition.key}
        name={definition.name}
        cellRenderer={renderer}
        columnHeaderCellRenderer={DefaultExternalHeaderCellRenderer(definition.name)}
      />
    );
  });

  return (
    <Table2
      enableRowResizing={false}
      numRows={actualPageLength}
      rowHeights={paginatedEntries.map(() => 24)}
      columnWidths={props.columns.map((def) => def.width || null)}>
      {columns}
    </Table2>
  );
};

export default Table;

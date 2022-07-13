import { FC, useContext, useState } from 'react';
import { Navbar, Alignment, Button } from '@blueprintjs/core';
import { Table2, Column, Cell, ICellRenderer, ICellProps } from '@blueprintjs/table';
import { useChaos, useChaosNested, useChaosAPI } from '@chaos-framework/react-lib';
import { EntityQuery, Query } from '@chaos-framework/api';
import { PaginatedChaosCollection } from '../../../Util/Pagination.js';
import { DockContextType } from 'rc-dock';
import { entityInspectorTabFactory } from '../../GUI/Tab/tabFactory.js';

type ColumnDefinition = {
  key: string;
  name: string;
  cellRenderer?: typeof defaultCellRenderer;
  columnHeaderCellRenderer?: typeof ColumnHeaderCellRenderer;
  format?: (value: string) => string;
  width?: number;
};

type QueryTableProps = { query: Query };
type NestedQueryValueProps = { queryFn: () => Query; parentQuery: Query };

const QueryValue: FC<QueryTableProps> = (props: QueryTableProps) => {
  const [value] = useChaos(props.query);
  return <span>{value}</span>;
};

const NestedQueryValue: FC<NestedQueryValueProps> = (props: NestedQueryValueProps) => {
  const [value] = useChaosNested(props.queryFn, props.parentQuery);
  return <span>{value}</span>;
};

const defaultCellRenderer = (rowIndex: number, columnIndex: number, value: string | number) => (
  <Cell key={`${rowIndex},${columnIndex}`}>
    <span>{value}</span>
  </Cell>
);

const ColumnHeaderCellRenderer = (columnIndex: number) => <Cell>{columnIndex}</Cell>;

interface EntityListProps {
  tabId?: string;
}

const EntityList: FC<EntityListProps> = (props: EntityListProps) => {
  const api = useChaosAPI();
  const context = useContext(DockContextType);
  const [entities, query] = useChaos(api.entities());
  const [pageNumber] = useState(0);
  const [pageLength] = useState(40);
  const pagination = new PaginatedChaosCollection(query);
  const paginatedEntities: EntityQuery[] = pagination.getPage(pageNumber, pageLength);
  const actualPageLength = paginatedEntities.length;
  const startingIndex = pageNumber * pageLength;
  const columnDefinition: ColumnDefinition[] = [
    {
      key: 'inspect',
      name: '',
      cellRenderer: (r: number, c: number) => (
        <Cell key={`${r},${c}`}>
          <Button
            minimal
            small
            icon="search"
            onClick={() =>
              context.dockMove(
                entityInspectorTabFactory(paginatedEntities[r]),
                props.tabId || null,
                'after-tab'
              )
            }
          />
        </Cell>
      ),
      width: 45
    },
    {
      key: 'id',
      name: 'id',
      cellRenderer: (r: number, c: number) => (
        <Cell key={`${r},${c}`}>
          <QueryValue query={paginatedEntities[r].id()} />
        </Cell>
      )
    },
    {
      key: 'name',
      name: 'Name',
      cellRenderer: (r: number, c: number) => (
        <Cell key={`${r},${c}`}>
          <QueryValue query={paginatedEntities[r].name()} />
        </Cell>
      )
    },
    {
      key: 'worldName',
      name: 'World Name',
      cellRenderer: (r: number, c: number) => (
        <Cell key={`${r},${c}`}>
          <NestedQueryValue
            queryFn={() => paginatedEntities[r]!.world().name()}
            parentQuery={paginatedEntities[r]}
          />
        </Cell>
      )
    }
  ];
  const columns = columnDefinition.map((definition) => (
    <Column
      key={definition.key}
      name={definition.name}
      cellRenderer={
        (definition.cellRenderer as ICellRenderer) ||
        ((rowIndex: number, cellIndex: number) =>
          defaultCellRenderer(startingIndex + rowIndex, cellIndex, 'undefined'))
      }
      columnHeaderCellRenderer={definition.columnHeaderCellRenderer}
    />
  ));
  return (
    <>
      <Table2
        enableRowResizing={false}
        numRows={actualPageLength}
        rowHeights={paginatedEntities.map(() => 24)}
        columnWidths={columnDefinition.map((def) => def.width || null)}>
        {columns}
      </Table2>
      <span>{'' + entities.size}</span>
    </>
  );
};

export default EntityList;

import { useContext, useState } from 'react';
import { Table2, Column, RenderMode } from '@blueprintjs/table';
import { useChaos, useChaosAPI } from '@chaos-framework/react-lib';
import { CollectionQuery, EntityQuery, IndividualQuery, Query } from '@chaos-framework/api';
import { DockContextType, TabData } from 'rc-dock';
import {
  DefaultExternalCellRenderer,
  ExternalCellRenderer,
  DefaultExternalHeaderCellRenderer,
  LinkCellRenderer
} from './CellRenderers.js';
import Paginator from '../Paginator/Paginator.js';
import { getQueriesPaginated } from './Pagination.js';
import { current } from '@reduxjs/toolkit';
import { uniqueId } from '@blueprintjs/core/lib/esm/common/utils/jsUtils.js';

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

export interface TableProps<T = GenericCollectionQuery> extends BaseTableProps {
  collectionQuery: T;
  columns: ColumnDefinition[];
  tabFactory?: (...props: any) => TabData;
}

const Table = (props: TableProps) => {
  const { collectionQuery, tabId, tabFactory } = props;

  const context = useContext(DockContextType);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageLength, setPageLength] = useState(props.pageLength || 20);
  const [totalPages, setTotalPages] = useState(Math.ceil(collectionQuery.value.size / pageLength));

  const paginatedEntries = getQueriesPaginated(collectionQuery, currentPage, pageLength);

  console.log('got rerenderedererered!!!');
  const actualPageLength = paginatedEntries.length;

  // const updateWithNewPage = (pageNumber: number) => {
  //   setCurrentPage(pageNumber);
  //   setPaginatedEntries(getQueriesPaginated(
  //     collectionQuery,
  //     pageNumber,
  //     pageLength
  //   ))
  // }

  const columns = props.columns.map((definition) => {
    const renderer = definition.link
      ? LinkCellRenderer(
          paginatedEntries,
          (value: IndividualQuery<any>) => {
            context.updateTab(props.tabId!, props.tabFactory!(value), true);
          },
          (value: IndividualQuery<any>) => {
            context.dockMove(props.tabFactory!(value), props.tabId!, 'after-tab');
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
    <>
      <Table2
        enableRowResizing={false}
        numRows={actualPageLength}
        rowHeights={paginatedEntries.map(() => 24)}
        columnWidths={props.columns.map((def) => def.width || null)}
        cellRendererDependencies={[pageLength, currentPage, totalPages]}
        renderMode={RenderMode.NONE}>
        {columns}
      </Table2>
      <Paginator
        currentPageNumber={currentPage}
        totalPageCount={totalPages}
        changeCallback={(newPageNumber: number) => setCurrentPage(newPageNumber)}
        pageLength={pageLength}
      />
    </>
  );
};

export default Table;

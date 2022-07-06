// import { FC, useState } from 'react';
// import { Navbar, Alignment, Button } from '@blueprintjs/core';
// import { Table2, Column, Cell, ICellRenderer } from '@blueprintjs/table';
// import { useChaos, useChaosAPI } from '@chaos-framework/react-lib';
// import ListContainer from '../../Structure/ListContainer/ListContainer.js';
// import { EntityQuery } from '@chaos-framework/api';

// type ColumnDefinition = {
//   key: string,
//   name: string,
//   cellRenderer?: typeof CellRenderer,
//   columnHeaderCellRenderer?: typeof ColumnHeaderCellRenderer
//   format?: (value: string) => string,
// }

// const CellRenderer = (rowIndex: number, columnIndex: number, value?: string | number) => (
//   <Cell key={`${rowIndex},${columnIndex}`} >{value || `${rowIndex}, ${columnIndex}`}</Cell>
// );

// const ColumnHeaderCellRenderer = (columnIndex: number) => (
//   <Cell>{columnIndex}</Cell>
// );

// const columnDefinition: ColumnDefinition[] = [
//   {
//     key: 'id',
//     name: 'id'
//   },
//   {
//     key: 'name',
//     name: 'Name'
//   },
// ];

// const EntityList: FC = () => {
//   const api = useChaosAPI();
//   const [entities, query] = useChaos(api.entities());
//   const [pageNumber] = useState(0);
//   const [pageLength] = useState(20);
//   const paginatedEntities: Entity[] = [];
//   const columns = columnDefinition.map((definition) => (
//     <Column
//       key={definition.key}
//       name={definition.name}
//       cellRenderer={definition.cellRenderer || ((rowIndex: number, cellIndex: number) => CellRenderer(rowIndex, cellIndex, paginatedEntities[])) }
//       columnHeaderCellRenderer={definition.columnHeaderCellRenderer}
//     />
//   ))
//   return (
//     <ListContainer title="Entities">
//       <Table2 enableRowResizing={true} numRows={pageLength}>
//         {columns}
//       </Table2>
//       <span>{'' + entities.size}</span>
//     </ListContainer>
//   );
// };

// export default EntityList;

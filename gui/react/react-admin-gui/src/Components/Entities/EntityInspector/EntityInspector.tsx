import { FC, useState } from 'react';
import { Navbar, Alignment, Button } from '@blueprintjs/core';
import { Table2, Column, Cell, ICellRenderer, ICellProps } from '@blueprintjs/table';
import { useChaos, useChaosNested, useChaosAPI } from '@chaos-framework/react-lib';
import ListContainer from '../../Structure/ListContainer/ListContainer.jsx';
import { EntityQuery, Query } from '@chaos-framework/api';
import { PaginatedChaosCollection } from '../../../Util/Pagination.js';

interface EntityInspectorProps {
  query: EntityQuery;
}

const EntityInspector: FC<EntityInspectorProps> = (props: EntityInspectorProps) => {
  const { query } = props;
  const [name] = useChaos(query.name());

  return <span>name</span>;
};

export default EntityInspector;

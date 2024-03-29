import { Button } from '@blueprintjs/core';
import { Cell } from '@blueprintjs/table';
import { IndividualQuery } from '@chaos-framework/api';
import { QueryValue } from '../QueryValueRenderer/QueryValueRenderer.js';

export type ExternalCellRenderer = (
  data: any[],
  value: string | number,
  formatter?: (s: string) => string
) => JSX.Element;

export const DefaultExternalHeaderCellRenderer = (name: string) => (columnIndex: number) => {
  return <Cell key={`header,${columnIndex}`}>{name}</Cell>;
};

export const DefaultExternalCellRenderer =
  (data: any[], queryKey: string, formatter?: (s: string) => string, tooltip?: string) =>
  (rowIndex: number, columnIndex: number) => {
    return (
      <Cell key={`${rowIndex},${columnIndex}`}>
        <QueryValue query={data[rowIndex]} queryKey={queryKey} formatter={formatter} />
      </Cell>
    );
  };

export const LinkCellRenderer =
  (
    data: any[],
    tabUpdater: (arg: any) => void,
    tabOpener: (arg: any) => void,
    renderer: (args: any) => void
  ) =>
  (rowIndex: number, columnIndex: number) => {
    const query = data[rowIndex];
    return (
      <Cell key={`${rowIndex},${columnIndex}`} interactive={true}>
        <Button minimal small icon="eye-open" onClick={() => tabOpener(query)} />
        <Button minimal small icon="share" onClick={() => tabOpener(query)} />
        <Button minimal small icon="locate" onClick={() => renderer(query)} />
      </Cell>
    );
  };

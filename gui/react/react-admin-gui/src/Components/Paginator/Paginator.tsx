import { FC } from 'react';
import { ControlGroup, Button, NumericInput, Label, Divider, FormGroup } from '@blueprintjs/core';

import './Paginator.css';

interface PaginatorProps {
  currentPageNumber: number;
  totalPageCount: number;
  pageLength: number;
  changeCallback: (newPage: number) => void;
}

const Paginator: FC<PaginatorProps> = (props: PaginatorProps) => {
  return (
    <FormGroup inline>
      <ControlGroup className="Paginator">
        <Label>Page</Label>
        <NumericInput
          value={props.currentPageNumber + 1}
          min={1}
          max={props.totalPageCount}
          fill
          buttonPosition="left"
          onValueChange={(n: number, s: string, undefined) => {
            props.changeCallback(n - 1);
          }}
        />
        <Label style={{ marginLeft: '5px' }}>of {props.totalPageCount}</Label>
        <Divider />
      </ControlGroup>
    </FormGroup>
  );
};

export default Paginator;

import { FC } from 'react';
import { FormGroup, InputGroup } from '@blueprintjs/core';
import { useChaos } from '@chaos-framework/react-lib';
import { ComponentQuery } from '@chaos-framework/api';

import './ComponentInspector.scss';

interface ComponentInspectorProps {
  query: ComponentQuery;
}

const ComponentInspector: FC<ComponentInspectorProps> = (props: ComponentInspectorProps) => {
  const { query } = props;
  const [name] = useChaos(query.name());

  return (
    <div className="ComponentInspector">
      <FormGroup label="Name" labelFor="name-input">
        <InputGroup id="name-input" placeholder="Name of the Component" value={name} disabled />
      </FormGroup>
    </div>
  );
};

export default ComponentInspector;

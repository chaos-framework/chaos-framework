import { FC, useState } from 'react';
import { FormGroup, InputGroup } from '@blueprintjs/core';
import { useChaos } from '@chaos-framework/react-lib';
import { EntityQuery } from '@chaos-framework/api';
import TeamSelect from '../../Teams/TeamSelect.js';

interface EntityInspectorProps {
  query: EntityQuery;
}

const EntityInspector: FC<EntityInspectorProps> = (props: EntityInspectorProps) => {
  const { query } = props;
  const [name] = useChaos(query.name());

  return (
    <div className="EntityInspector">
      <FormGroup label="Name" labelFor="name-input">
        <InputGroup id="name-input" placeholder="Name of the entity" value={name} disabled />
      </FormGroup>
      <FormGroup label="Team">
        <TeamSelect initial={query.team()!} />
      </FormGroup>
      <FormGroup label="Attributes" labelFor="text-input"></FormGroup>
      <FormGroup label="Components" labelFor="text-input"></FormGroup>
    </div>
  );
};

export default EntityInspector;

import { Button, MenuItem } from '@blueprintjs/core';
import { Select2 } from '@blueprintjs/select';
import { TeamQuery } from '@chaos-framework/api';
import { useChaos, useChaosAPI } from '@chaos-framework/react-lib';
import { FC, useState } from 'react';

const TeamSelectClass = Select2.ofType<TeamQuery>();

interface TeamSelectProps {
  initial: TeamQuery;
}

const TeamSelect: FC<TeamSelectProps> = (props: TeamSelectProps) => {
  const api = useChaosAPI();
  const [, teams] = useChaos(api.teams());
  const values = teams.values();
  const [current, setCurrent] = useState(props.initial);
  return (
    <TeamSelectClass
      items={values}
      itemRenderer={(q: TeamQuery) => <MenuItem key={q.id().value} text={q.value.name} role="listitem" />}
      onItemSelect={() => {}}>
      <Button key={current.value.name} rightIcon="caret-down">
        {current.value.name}
      </Button>
    </TeamSelectClass>
  );
};

export default TeamSelect;

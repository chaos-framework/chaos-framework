import React from 'react';
import { Box, Newline, Text, useApp, useInput } from 'ink';
import { Server } from '@chaos-framework/core';
import { ChaosProvider, useChaos, useChaosAPI } from '@chaos-framework/react-lib';
import { EntityQuery, QueryAPI } from '@chaos-framework/api';

import MessageLog from './Terminal/MessageLog.js';

interface UIProps {
  api: QueryAPI;
  server: Server;
}

const EntityList = (props: any) => {
  const api = useChaosAPI();
  const [entities, query] = useChaos(api.entities());
  return (
    <Box flexGrow={1}>
      <Text>{Array.from(query.map(([key, subquery]: any) => <EntityInfoRenderer key={key} query={subquery} />))}</Text>
    </Box>
  );
};

interface EntityProps {
  query: EntityQuery;
}

const EntityInfoRenderer = (props: EntityProps) => {
  const { query } = props;
  const [name] = useChaos(query.name());
  return (
    <Text color="green">
      {name}
      <Newline />
    </Text>
  );
};

const UI = (props: UIProps) => {
  const { exit } = useApp();

  const { api, server } = props;

  useInput((input, key) => {
    if (input === 'q') {
      if (server !== undefined) props.server.shutdown();
      exit();
    }
  });

  return (
    <ChaosProvider value={api}>
      {/* <FullScreen> */}
      <Box borderStyle="double" width="100%" flexDirection="row">
        <MessageLog />
        <EntityList />
      </Box>
      {/* </FullScreen> */}
    </ChaosProvider>
  );
};

export default UI;

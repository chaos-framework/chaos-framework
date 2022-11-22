#!/usr/bin/env node
import React from 'react';
import meow from 'meow';
import { render } from 'ink';
import { Chaos, processRunner, isGame } from '@chaos-framework/core';
import { IOServer } from '@chaos-framework/socket-io';
import { QueryAPI } from '@chaos-framework/api';

import { parseCmdOptions, parseOptionsFile } from './Util/options.js';
import UI from './ui.js';

// Define help text and CLI arguments
const cli = meow(
  `
  Usage
    $ chaos ../some-chaos-game/bin
    $ chaos ../some-chaos-game/bin optionFoo=bar optionFlag

  Parameters
    The first parameter is a path (or other, see below) to a Chaos game.
    All following parameters are options for the game in either key=value
    format or just specifying the key which will set it to true. Options
    passed will override a supplied options file.

  Options
    --options, -o Path to local file containing options for the game in
      a single top-level JSON object
    --npm, -n (NOT YET IMPLEMENTED) Indicates that the path given is an
      NPM package (with optional version) to download
    --git, -g (NOT YET IMPLEMENTED) Indicates that the path given is a
      link to a .git repository online
    --github, -gh (NOT YET IMPLEMENTED) Indicates that the path given is
      an alias of a Github repo/directory ie chaos-framework/examples/chess

  Notes
    It is assumed that the path given is to a local folder with an
    index.js where the default export matches the Game interface in
    @chaos-framework/core. Otherwise the flags --github, --git, and
    --npm are prioritized in that order. Specifying --github and
    --npm will ignore the --npm flag, for example.
  `,
  {
    importMeta: import.meta,
    flags: {
      options: {
        type: 'string',
        alias: 'o',
        isRequired: false,
      },
    },
  },
);

// Make sure a path for a game was specified
const path = cli.input[0] as string;
if (path === undefined) {
  // Show the help text and exit the process
  cli.showHelp(1);
} else {
  const optionsPath = cli.flags.options as string | undefined;
  const optionsFromCmd = parseCmdOptions(cli.input.slice(1));
  console.log(optionsFromCmd);
  run(path, optionsFromCmd, optionsPath);
}

let server: IOServer;

// Ensure we exit gracefully
process.on('exit', () => {
  if (server !== undefined) {
    server.shutdown();
  }
});

async function run(path: string, optionsFromCmd: any = {}, optionsFilePath?: string) {
  try {
    // Import the game passed
    console.log(`Loading ${path}`);
    const game = (await import(path)) as any;
    if (!isGame(game)) {
      throw new Error(`Module specified at ${path} is not a proper Chaos game module.`);
    }
    // Create the API reference
    const api = new QueryAPI(game);
    // Start the server with the options passed
    server = new IOServer(1980, game, { cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] } });
    const optionsFromFile = optionsFilePath !== undefined ? await parseOptionsFile(optionsFilePath) : {};
    const options = Object.assign(optionsFromFile, optionsFromCmd);
    console.log(`Options: ${JSON.stringify(options)}`);
    // Initialize the game
    await processRunner(await game.initialize(options));
    // Render the UI and wait for exit signal
    render(<UI api={api} server={server} />, { patchConsole: false });
    processRunner(game.play(), true); // TODO may want to let the user kick this off when ready
  } catch (err) {
    console.error((err as Error).message);
    process.exit(0);
  }
}

import { Queue } from "queue-typescript";

import { Game, Entity, Component, Mechanic, Subroutine, CallableSubroutine, defaultProcessor, Processor, Command, CommandWithContext, RegisteredPlugin, Plugin, ComponentContainer } from "./internal.js";

export type ChaosConfiguration = {
  processor?: Processor,
  plugins: any[]
}

export class Chaos extends ComponentContainer {
  entities = new Map<string, Entity>();
  // components = new Map<string, Component>();

  players = new Map<string, any>(); // TODO
  admins = new Map<string, any>(); // TODO

  processor: Processor;
  processing = false;
  commandTimeout = 500; // Timeout, in milliseconds, for a command to be considered stale
  queuedCommands: Queue<CommandWithContext> = new Queue<CommandWithContext>;
  
  messageBuses: Map<string, Mechanic[]> = new Map<string, Mechanic[]>();

  plugins: RegisteredPlugin[] = [];

  constructor(private game: Game, configuration: ChaosConfiguration) {
    super();
    this.processor = configuration.processor ?? defaultProcessor;
    for (const plugin of configuration.plugins) {
      this.registerPlugin(plugin);
    }
  }

  connectMechanic(mechanic: Mechanic) {
    for (const name of mechanic.messageTypes) {
      if (!this.messageBuses.has(name)) {
        this.messageBuses.set(name, [mechanic]);
      } else {
        this.messageBuses.get(name)!.push(mechanic);
      }
    }
  }

  disconnectMechanic(mechanic: Mechanic) {
    for (const name of mechanic.messageTypes) {
      const arr = this.messageBuses.get(name);
      if (arr) {
        const index = arr.findIndex(result => result === mechanic);
        if (index >= 0) {
          arr.splice(index, 1);
        }
      }
    }
  }

  registerPlugin(plugin: Plugin) {
    const registered = { registeredAt: new Date(), active: true, ...plugin } as RegisteredPlugin;
    this.plugins.push(registered);
  }

  // TODO unregister plugin
  // TODO activate plugin
  // TODO deactivate plugin

  recieveCommand(command: CommandWithContext) {
    this.queuedCommands.append(command);
    this.process();
  }

  async process() {
    if (this.processing) {
      return;
    }

    this.processing = true;

    // Iterate over commands in order they were recieved (from the front of the queue)
    for (const command of this.queuedCommands) {
      // Check if this command is stale and discard if so
      if (this.isCommandStale(command)) {
        continue; // TODO handle notifying client of error?
      }

      // TODO let command plugins handle

      // TODO turn a command into a subroutine
      const subroutine = {} as unknown as Subroutine;

    }

    this.processing = false;
  }

  isCommandStale(command: CommandWithContext) {
    return command.receivedAt.getTime() < (Date.now() - this.commandTimeout);
  }

  async *broadcast(messageType: string, payload: any): Subroutine {
    
  }

}

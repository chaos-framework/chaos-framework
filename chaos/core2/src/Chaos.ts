import { Queue } from "queue-typescript";

import { Game, Entity, Component, Mechanic, Subroutine, CommandWithContext, RegisteredPlugin, Plugin, ComponentContainer, CastCommand, CommandError, EffectWithContext, CommandHandler, EffectHandler, GameProcessor, UpdateProcessor, EffectProcessor } from "./internal.js";
import { NetworkProcessor } from "./Processor/NetworkProcessor.js";

export type ChaosConfiguration = {
  plugins?: any[]
}

export class ChaosInstance extends ComponentContainer {
  entities = new Map<string, Entity>();
  components = new Map<string, Component>();

  players = new Map<string, any>(); // TODO
  admins = new Map<string, any>(); // TODO

  processing = false;
  commandTimeout = 500; // Timeout, in milliseconds, for a command to be considered stale
  queuedCommands: Queue<CommandWithContext> = new Queue<CommandWithContext>;
  
  messageBuses: Map<string, Mechanic[]> = new Map<string, Mechanic[]>();

  plugins: RegisteredPlugin[] = [];

  constructor(private game: Game, configuration: ChaosConfiguration) {
    super();
    if (configuration?.plugins) {
      for (const plugin of configuration.plugins) {
        this.registerPlugin(plugin);
      }
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
      // TODO optimize
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
    for (let command of this.queuedCommands) {
      // Check if this command is stale and discard if so
      if (this.isCommandStale(command)) {
        continue; // TODO handle notifying client of "failure"?
      }

      let rejected = false;

      for (const plugin of this.plugins) {
        if (plugin.onCommand) {
          const processedCommand = await plugin.onCommand(this, command);
          if (!processedCommand) {
            // one of the plugins has rejected this command, no need to keep processing
            rejected = true;
            break;
          }
          command = processedCommand;
        }
      }

      if (rejected) {
        // TODO let the client know, somehow
        continue;
      }

      const subroutine = this.handleCommand(command)!;
      await this.runSubroutine(subroutine);

    }
    this.processing = false;
  }

  async runSubroutine(subroutine: Subroutine) {
    const processorStack = this.getProcessorStack(subroutine);

    let result: any = { value: undefined, done: false };

    while (!result.done) {
      result = await processorStack.next(result.value);
    }

    // If the subroutine has RETURNED another subroutine as a "followup", we should execute that as well
    if (result.done && result.value && typeof result === 'object') {
      await this.runSubroutine(result.value);
    }
  }

  getProcessorStack(subroutine: Subroutine) {
    return NetworkProcessor(this, subroutine, [UpdateProcessor, EffectProcessor, GameProcessor]);
  }

  handleCommand(command: CommandWithContext): Subroutine | undefined {
    switch (command.type) {
      case 'CAST':
        return this.handleCommand(command);
      default:
        return undefined;
    }
  }

  handleCast(cast: CastCommand): Subroutine {
    const caster = this.entities.get(cast.payload.caster);
    if (!caster) {
      throw new CommandError(`Entity with id ${cast.payload.caster} not found.`) 
    }
    const ability = caster.abilities.get(cast.payload.ability)?.get(cast.payload.grantedBy);
    if (!ability) {
      throw new CommandError(`Ability with name ${cast.payload.ability} and granter ${cast.payload.grantedBy} not found.`) 
    }

    const processedParams = ability.processParameters(this, cast.payload.parameters);
    return ability.cast({ depth: 0 }, processedParams);
  }

  isCommandStale(command: CommandWithContext) {
    return command.receivedAt.getTime() < (Date.now() - this.commandTimeout);
  }

  async *broadcast(messageType: string, payload: any): Subroutine {
    
  }

}

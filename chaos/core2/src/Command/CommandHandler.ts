import { ChaosInstance, CommandWithContext, Subroutine } from '../internal.js'

export type CommandHandler = (instance: ChaosInstance, command: CommandWithContext) => Promise<Subroutine>;

export async function *defaultCommandHandler(instance: ChaosInstance, command: CommandWithContext): Subroutine {
  for (const plugin of instance.plugins) {
    if (plugin.onCommand) {
      const processedCommand = await plugin.onCommand(instance, command);
      if (!processedCommand) {
        // one of the plugins has rejected this command, move onto the next
        continue;
      }
      command = processedCommand;
    }
  }

  for (const plugin of instance.plugins) {
    if (plugin.postCommand) {
      await plugin.postCommand(instance, command);
    }
  }
}
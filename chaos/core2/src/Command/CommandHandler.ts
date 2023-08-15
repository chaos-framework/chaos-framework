// import { CastCommand, ChaosInstance, CommandError, CommandWithContext, Subroutine } from '../internal.js'

// export type CommandHandler = (instance: ChaosInstance, command: CommandWithContext) => Promise<Subroutine>;

// export async function *commandHandler(instance: ChaosInstance, command: CommandWithContext): Subroutine {
//   for (const plugin of instance.plugins) {
//     if (plugin.onCommand) {
//       const processedCommand = await plugin.onCommand(instance, command);
//       if (!processedCommand) {
//         // one of the plugins has rejected this command, move onto the next
//         continue;
//       }
//       command = processedCommand;
//     }
//   }

//   let subroutine: Subroutine;

//   switch (command.type) {
//     case 'CAST':
//       subroutine = getCastSubroutine(instance, command);
//       break;
//   }

//   // Pass the subroutine to the event handler -- this handler only cares about beginning and ends of commands
//   yield * effectHandler(instance, subroutine);

//   for (const plugin of instance.plugins) {
//     if (plugin.postCommand) {
//       await plugin.postCommand(instance, command);
//     }
//   }
// }

// // TODO add cast context, or have the cast function do it
// const getCastSubroutine = (instance: ChaosInstance, cast: CastCommand): Subroutine => {
//   const caster = instance.entities.get(cast.payload.caster);
//   if (!caster) {
//     throw new CommandError(`Entity with id ${cast.payload.caster} not found.`) 
//   }
//   const ability = caster.abilities.get(cast.payload.ability)?.get(cast.payload.grantedBy);
//   if (!ability) {
//     throw new CommandError(`Ability with name ${cast.payload.ability} and granter ${cast.payload.grantedBy} not found.`) 
//   }

//   const processedParams = ability.processParameters(instance, cast.payload.parameters);
//   return ability.cast({ depth: 0 }, processedParams);
// }

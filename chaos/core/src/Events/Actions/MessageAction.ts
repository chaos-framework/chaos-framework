// import {
//   Action,
//   ActionParameters,
//   TerminalMessage,
//   ActionType,
//   BroadcastType,
//   ProcessEffectGenerator
// } from '../../internal.js';

// export class MessageAction extends Action {
//   actionType = ActionType.MESSAGE;
//   broadcastType = BroadcastType.SENSED_ACTION;

//   terminalMessage: TerminalMessage | ((action: Action) => TerminalMessage);

//   constructor({ caster, message, using, metadata }: MessageAction.Params) {
//     super({ caster, using, metadata });
//     this.terminalMessage = message;
//   }

//   async *apply(): ProcessEffectGenerator {
//     return true;
//   }
// }

// // tslint:disable-next-line: no-namespace
// export namespace MessageAction {
//   export interface Params extends ActionParameters {
//     message: TerminalMessage | ((action: Action) => TerminalMessage);
//   }
// }

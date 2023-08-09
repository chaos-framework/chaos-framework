import { AbilityParameters, ChaosInstance, CommandWithContext, Component, EffectContext, EffectWithContext } from "./internal.js";

export type Subroutine = AsyncGenerator<EffectWithContext, EffectWithContext | void, EffectWithContext>;
export type CallableSubroutine = (context: EffectContext, ...args: any[]) => Subroutine;

export type MechanicParameters = [context: EffectContext, payload: any];

export type Mechanic = ((context: EffectContext, payload:any) => Promise<Subroutine>) & { messageTypes: string[], scope?: string };

export type Game = {
  initialize: CallableSubroutine,
  onPlayerJoin: CallableSubroutine,
  onPlayerQuit: CallableSubroutine,
  reset: CallableSubroutine,
  shutdown?: CallableSubroutine,
};

export type Publishable = { _publish: () => void, _unpublish: () => void };

export type Plugin = {
  name: string,
  onCommand?: (instance: ChaosInstance, command: CommandWithContext) => Promise<CommandWithContext | undefined>,
  postCommand?: (instance: ChaosInstance, command: CommandWithContext) => Promise<CommandWithContext | undefined>,
  onEffect?: (instance: ChaosInstance, effect: EffectWithContext) => Promise<EffectWithContext>,
  postEffect?: (instance: ChaosInstance, effect: EffectWithContext) => Promise<EffectWithContext>,
  onSerialize?: (instance: ChaosInstance, effect: EffectWithContext) => Promise<any>
};

export type RegisteredPlugin = {
  registeredAt: Date,
  active: boolean
} & Plugin;

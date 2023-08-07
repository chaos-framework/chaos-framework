import { Chaos, Component } from "./internal.js";

export interface UpdateProperties {
  target?: any,
  caster?: any,
  using?: any
}

export type Effect<T = string, P = any> = {
  type: T,
  payload: P
}

export type EffectContext = {
  processed?: boolean,
  game?: Chaos,
  depth?: number,
  previous?: EffectContext,
  parent?: Component, // TODO or ability
};

export type EffectWithContext<T = Effect> = T & EffectContext;

export type Broadcast = Effect<'BROADCAST', { name: string, payload: any}>;
export const broadcast = (name: string, payload: any): Broadcast => ({ type: 'BROADCAST', payload: { name, payload }});

export type CallSubroutine = Effect<'SUBROUTINE' | 'SUB', { subroutine: CallableSubroutine, args: any[] }>;

export type Call = Effect<'CALL' | 'FN', { fn: Function, args: any[] }>;
export const call = (fn: Function, ...args: any[]) => ['CALL', fn, args];

export type Subroutine = AsyncGenerator<EffectWithContext, EffectWithContext | void, any>;
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

export type Command = { type: string, payload: any };
export type CommandWithContext = { player: any, receivedAt: Date } & Command;

export type Plugin = {
  name: string,
  fn: (effect: EffectWithContext) => void
}
export type RegisteredPlugin = {
  registeredAt: Date,
  active: boolean
} & Plugin
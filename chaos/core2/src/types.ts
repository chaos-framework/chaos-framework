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

export type Call = Effect<'CALL', { subroutine: CallableSubroutine, args: any[] }>;
export const call = (subroutine: Subroutine, ...args: any[]) => ['RUN', subroutine, args];

export type Subroutine = AsyncGenerator<EffectWithContext, EffectWithContext | void, any>;
export type CallableSubroutine = (...args: any[]) => Promise<Subroutine>;

export type MechanicParameters = [context: EffectContext, payload: any];

export type Mechanic = ((context: EffectContext, payload:any) => Promise<Subroutine>) & { messageTypes: string[], scope?: string };

export type Game = {
  initialize: Subroutine,
  onPlayerJoin: Subroutine,
  onPlayerQuit: Subroutine,
  reset: Subroutine,
  shutdown?: Subroutine,
}
import { CallableSubroutine, ChaosInstance, Component, Entity, Vector2 } from "../internal.js";

// EFFECTS

export type Effect<T = string, P = any> = {
  type: T,
  payload: P
}

export type EffectContext = {
  processed?: boolean,
  game?: ChaosInstance,
  depth?: number,
  previous?: EffectContext,
  parent?: Component, // TODO or ability
};

export type EffectWithContext<T = Effect> = T & EffectContext;

export type Broadcast = Effect<'BROADCAST', { name: string, payload: any}>;
export const broadcast = (name: string, payload?: any): Broadcast => ({ type: 'BROADCAST', payload: { name, payload }});

export type CallSubroutine = Effect<'SUBROUTINE' | 'SUB', { subroutine: CallableSubroutine, args: any[] }>;

export type Call = Effect<'CALL' | 'FN', { fn: Function, args: any[] }>;
export const call = (fn: Function, ...args: any[]) => ['CALL', fn, args];

// UPDATES

export type CommonUpdateProperties = {
  target?: any,
  caster?: any,
  using?: any,
  metadata?: { [key: string]: any }
}

export type Move = Effect<'MOVE', CommonUpdateProperties & { target: Entity, to: Vector2 }>
export type PublishEntity = Effect<'PUBLISH', CommonUpdateProperties & { target: Entity, to: any, at: Vector2 }>

export type Update = Move | PublishEntity
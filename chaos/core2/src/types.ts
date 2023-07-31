import { Chaos } from "./internal.js";

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
  game?: Chaos,
  depth?: number,
  parent?: any,
  component?: any,
};

export type EffectWithContext = Effect & EffectContext;

export type Broadcast = Effect<'BROADCAST', { name: string, payload: any}>;
export const broadcast = (name: string, payload: any): Broadcast => ({ type: 'BROADCAST', payload: { name, payload }});

export type Inner = ['INNER', string, any];
export const inner = (name: string, payload: any) => ['INNER', payload];

export type Run = ['RUN', Subroutine];
export const run = (subroutine: Subroutine) => ['RUN', subroutine];

export type Call = ['CALL', CallableSubroutine, ...any[]];
export const call = (subroutine: Subroutine, ...args: any[]) => ['RUN', subroutine, args];

export type Subroutine = AsyncGenerator<EffectWithContext, EffectWithContext | void, any>;
export type CallableSubroutine = (...args: any[]) => Promise<Subroutine>;

export type MechanicParameters = [context: EffectContext, payload: any];

export type Mechanic = ((context: EffectContext, payload:any) => Promise<Subroutine>) & { messageTypes: string[], scope?: string }
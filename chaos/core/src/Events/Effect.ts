import { Action, Component, Entity, TerminalMessage } from '../internal.js';

export type Effect = readonly [string, any];

export type EffectGenerator<T = Effect, R = any, N = any> = AsyncGenerator<T, R, N>;
export type EffectRunner<T extends Effect = Effect, R = any, N = any> = {
  run(): EffectGenerator<T, R, N>;
};

export function isEffectRunner(o: any): o is EffectRunner {
  return o.any !== undefined;
}

export function isEffectGenerator(o: any): o is EffectGenerator {
  return o.next !== undefined;
}

export type ActionHandler<T extends Action = Action> = (action: T, ...params: any[]) => EffectGenerator;

export type Immediate = readonly ['IMMEDIATE', EffectRunner];
export type Followup = readonly ['FOLLOWUP', EffectRunner];
export type Delay = readonly ['DELAY', number];

export type ProcessEffect = Immediate | Followup | Delay;
export type ProcessEffectKey = ProcessEffect[0];
export type ProcessEffectGenerator<T = boolean> = EffectGenerator<ProcessEffect, T>;
export type ProcessEffectRunner = EffectRunner<ProcessEffect, boolean>;

export type Permit = readonly [
  'PERMIT',
  {
    priority: number;
    by?: Entity | Component;
    using?: Entity | Component;
    message?: string | TerminalMessage;
  }
];
export type Deny = readonly [
  'DENY',
  {
    priority: number;
    by?: Entity | Component;
    using?: Entity | Component;
    message?: string | TerminalMessage;
  }
];

export type ActionEffect = Permit | Deny;
export type ActionEffectKey = ActionEffect[0];
export type ActionEffectGenerator<T = boolean> = EffectGenerator<ActionEffect, T>;
export type ActionEffectRunner = EffectRunner<ActionEffect, boolean>;

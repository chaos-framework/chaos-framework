import { Component, ComponentContainer, Scope } from '@chaos-framework/core';

/**
 * Decorator factory to bind instance method on a Component to action handler for the action
 * phase * and (optional) scope specified.
 * @param this `this` context
 * @param phase The action phase we want to call
 * @param scope The Scope we want to use. Defaults to `'default'`
 * @returns
 */
export function OnPhase(this: any, phase: string, scope: Scope | 'default' = 'default') {
  return (target: Component, propertyKey: string, descriptor: PropertyDescriptor) => {
    const handlers = (target.actionHandlers ??= {});
    const phases = (handlers[scope] ??= {});
    const functions = (phases[phase] ??= []);
    functions.push(async function* (this: any, ...args: any[]) {
      yield* descriptor.value.apply(this, args);
    });
  };
}

export const On = OnPhase;

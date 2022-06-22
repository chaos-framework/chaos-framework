import { Action, ActionHandler, EffectGenerator } from '@chaos-framework/core';

type Constructor<T> = { new (...args: any[]): T };

/** Runs handler only if `action instanceOf className` */
export function ForAction<T extends Action>(this: any, className: Constructor<T>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<ActionHandler<T>>
  ) {
    const original = descriptor.value!;
    async function* func(this: any, action: T): EffectGenerator {
      if (action instanceof className) {
        yield* original.apply(this, [action]);
      }
    }
    descriptor.value = func;
  };
}

export const For = ForAction;

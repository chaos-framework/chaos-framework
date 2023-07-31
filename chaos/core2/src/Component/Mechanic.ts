import { MechanicParameters, Mechanic, EffectContext, EffectWithContext, Component, ComponentParent } from "../internal.js";

// Decorates a mechanic, binding passed context to yielded effects and registering with the message bus
export function mechanic(messageType: string, scope?: string): any
export function mechanic(messageTypes: string[], scope?: string): any
export function mechanic(messageOrMessageTypes: string | string[], scope?: string) {
  messageOrMessageTypes = typeof messageOrMessageTypes === 'string' ? [messageOrMessageTypes] : messageOrMessageTypes;
  return function decorator<This, Args extends MechanicParameters, Return>(originalMethod: Mechanic, context: ClassMethodDecoratorContext<Component>) {
      originalMethod['messageTypes'] = messageOrMessageTypes as string[];
      originalMethod['scope'] = scope;
      const methodName = context.name;
      context.addInitializer(function (this: Component) {
        // make sure we keep "this" bound
        (this as any)[methodName] = (this as any)[methodName].bind(this);
        // register the mechanic for each instance
        this.mechanics.push(originalMethod);
      });

      async function *decoratedMechanic(this: Component, context: EffectContext, payload: any) {
        const subroutine = await originalMethod.apply(this, [context, payload]);
        for await (const effect of subroutine) {
          yield {
            ...effect,
            ...context,
            component: this
          } as EffectWithContext
        }
      }

      return decoratedMechanic;
  }
}
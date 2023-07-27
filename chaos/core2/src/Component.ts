import { Chaos } from "./Chaos.js";
import { CallableSubroutine, Mechanic, Subroutine } from "./internal.js";

export function mechanic(messageType: string, scope?: string) {
  return function innerMechanic(originalMethod: any, context: ClassMethodDecoratorContext) {
      originalMethod['messageType'] = messageType;
      originalMethod['scope'] = scope;
      const methodName = context.name;
      context.addInitializer(function (this: any) {
        // make sure we keep "this" bound
        this[methodName] = this[methodName].bind(this);
        // register the mechanic for each instance
        this.mechanics.push(originalMethod);
      });
      return originalMethod;
  }
}

export abstract class Component {
  static mechanics: Mechanic[] = [];

  constructor(private game: Chaos) {

  }

  activate() {
  }

  deactivate() {
  }
}

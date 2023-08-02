import { Game, Entity, Component, Mechanic, Subroutine, CallableSubroutine, defaultProcessor, Processor } from "./internal.js";

export type ChaosConfiguration = {
  processor?: Processor,
  // plugins: any[]
}

export class Chaos {
  entities = new Map<string, Entity>();
  // components = new Map<string, Component>();

  players = new Map<string, any>(); // TODO
  admins = new Map<string, any>(); // TODO

  processor: Processor;
  messageBuses: Map<string, Mechanic[]> = new Map<string, Mechanic[]>();

  plugins: any[] = []; // TODO

  constructor(private game: Game, configuration: ChaosConfiguration) {
    this.processor = configuration.processor ?? defaultProcessor;
  }

  connectMechanic(mechanic: Mechanic) {
    for (const name of mechanic.messageTypes) {
      if (!this.messageBuses.has(name)) {
        this.messageBuses.set(name, [mechanic]);
      } else {
        this.messageBuses.get(name)!.push(mechanic);
      }
    }
  }

  disconnectMechanic(mechanic: Mechanic) {
    for (const name of mechanic.messageTypes) {
      const arr = this.messageBuses.get(name);
      if (arr) {
        const index = arr.findIndex(result => result === mechanic);
        if (index >= 0) {
          arr.splice(index, 1);
        }
      }
    }
  }

  async *broadcast(messageType: string, payload: any): Subroutine {
    
  }

}

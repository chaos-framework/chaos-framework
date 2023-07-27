import { Entity, ProcessEffectRunner, chaosUniqueId, EventBegin, EventEnd } from '../internal.js';
import { ProcessEffectGenerator } from './Effect.js';

export abstract class Event implements ProcessEffectRunner {

  constructor(public id: string = chaosUniqueId(), public name?: string, public caster?: Entity) {}

  async *run(): ProcessEffectGenerator {
    // Notify the system that this event is starting
    const begin = new EventBegin(this);
    yield [ 'IMMEDIATE', begin ];
    // Run the event if it is permitted
    if (begin.permitted) {
      yield * this.fire();
    }
    // Notify the system that the event is ending
    yield [ 'IMMEDIATE', begin.end() ];
    return true;
  }

  abstract fire(): ProcessEffectGenerator;

}

// tslint:disable-next-line: no-namespace
export namespace Event {
  export interface Serialized {

  }
}
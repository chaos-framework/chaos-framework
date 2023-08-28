import { Queue } from "queue-typescript";

import { Broadcast, Call, CallSubroutine, ChaosInstance, EffectContext, EffectWithContext, Subroutine, SubroutineResult, Processor } from "../internal.js"

// async function afterEach(instance: ChaosInstance, effect: EffectWithContext) {
  // switch(effect.type) {
  //   case 'FN':
  //   case 'CALL':
  //     const { fn, args } = (effect as EffectWithContext<Call>).payload;
  //     return await fn(...args);
  //   case 'SUB':
  //   case 'SUBROUTINE':
  //     const { subroutine, args: subArgs } = (effect as EffectWithContext<CallSubroutine>).payload;
  //     return subroutine(deriveNewContext(effect), ...subArgs);
  //   case 'BROADCAST':
  //     const { name, payload } = (effect as EffectWithContext<Broadcast>).payload;
  //     const broadcast = instance.broadcast(name, payload); // TODO add new context
  //     return broadcast;
  // }
// } 

// const deriveNewContext = (previous: EffectWithContext): EffectContext => {
//   return {
//     previous,
//     depth: previous.depth ? previous.depth + 1 : 1
//   }
// }

// export const GameProcessor = buildProcessor({ afterEach });

export class GameProcessor extends Processor {
  async *process(subroutine: Subroutine): Subroutine {
    let result: SubroutineResult;
    let effect: EffectWithContext | undefined;
    let next: any = undefined;

    subroutine = this.inner ? this.inner.process(subroutine) : subroutine;

    const followups = new Queue<Subroutine>(subroutine);

    do {
      subroutine = followups.dequeue();
      do {
        result = await subroutine.next(next);
        if (result.value) {
          effect = result.value as EffectWithContext;

          // Reassign the effect to the result of any higher-order processes
          effect = yield effect;
          effect ??= effect;
  
          switch(effect.type) {
            case 'FN':
            case 'CALL':
              const { fn, args } = (effect as EffectWithContext<Call>).payload;
              next = await fn(...args);
              break;
            case 'SUB':
            case 'SUBROUTINE':
              const { subroutine, args: subArgs } = (effect as EffectWithContext<CallSubroutine>).payload;
              next = subroutine(this.deriveNewContext(effect), ...subArgs);
              break;
            case 'BROADCAST':
              const { name, payload } = (effect as EffectWithContext<Broadcast>).payload;
              const broadcast = this.instance.broadcast(name, payload); // TODO add new context
              next = broadcast;
              break;
            case 'FOLLOWUP':
              const { name: followupName , payload: followupPayload } = (effect as EffectWithContext<Broadcast>).payload;
              followups.enqueue(followupPayload.fn);
              next = effect;
              break;
          }
        }
      } while (result.value && !result.done)
    } while (followups.length > 0)

    if (result.done) {
      return next || result;
    }
  }

  deriveNewContext(previous: EffectWithContext): EffectContext {
    return {
      previous,
      depth: previous.depth ? previous.depth + 1 : 1
    }
  }
}

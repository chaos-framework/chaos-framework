import { Broadcast, Call, CallSubroutine, ChaosInstance, EffectContext, EffectWithContext, Subroutine } from "../internal.js"

export async function *gameProcessor(instance: ChaosInstance, subroutine: Subroutine): Subroutine {
  let result: IteratorResult<EffectWithContext, EffectWithContext | void>;
  let effect: EffectWithContext;
  let next: any;
  do {
    result = await subroutine.next(next);
    if (result.value) {
      effect = result.value;
      if (effect) {
        effect = yield effect;
        
        // Process the effect internally, if applicable
        switch(effect.type) {
          case 'FN':
          case 'CALL':
            const { fn, args } = (effect as EffectWithContext<Call>).payload;
            next = await fn(...args);
            break;
          case 'SUB':
          case 'SUBROUTINE':
            const { subroutine, args: subArgs } = (effect as EffectWithContext<CallSubroutine>).payload;
            next = subroutine(deriveNewContext(effect), ...subArgs);
            break;
          case 'BROADCAST':
            const { name, payload } = (effect as EffectWithContext<Broadcast>).payload;
            const broadcast = instance.broadcast(name, payload); // TODO add new context
            next = broadcast;
            break;
          default:
            next = effect;
        }
      }
    }
  } while (!result.done)
}

const deriveNewContext = (previous: EffectWithContext): EffectContext => {
  return {
    previous,
    depth: previous.depth ? previous.depth + 1 : 1
  }
}

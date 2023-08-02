import { Broadcast, Call, Chaos, EffectContext, EffectWithContext, Subroutine } from "../internal.js"

export async function *process(instance: Chaos, subroutine: Subroutine): Subroutine {
  let result: IteratorResult<EffectWithContext, EffectWithContext | void>;
  let effect: EffectWithContext;
  let next: any;
  do {
    result = await subroutine.next(next);
    if (result.value) {
      effect = result.value;
      if (effect) {
        // Yield the effect to allow it to be preprocessed by any plugins and/or published
        yield effect;

        // Process the effect internally, if applicable
        const newContext = deriveNewContext(effect);
        switch(effect.type) {
          case 'CALL':
            const { subroutine, args } = (effect as EffectWithContext<Call>).payload;
            next = subroutine(newContext, ...args);
            break;
          case 'BROADCAST':
            const { name, payload } = (effect as EffectWithContext<Broadcast>).payload;
            const broadcast = instance.broadcast(name, payload);
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

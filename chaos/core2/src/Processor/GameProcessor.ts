import { Broadcast, Call, CallSubroutine, ChaosInstance, EffectContext, EffectWithContext, Subroutine, SubroutineResult, buildProcessor } from "../internal.js"

async function afterEach(instance: ChaosInstance, effect: EffectWithContext) {
  switch(effect.type) {
    case 'FN':
    case 'CALL':
      const { fn, args } = (effect as EffectWithContext<Call>).payload;
      return await fn(...args);
    case 'SUB':
    case 'SUBROUTINE':
      const { subroutine, args: subArgs } = (effect as EffectWithContext<CallSubroutine>).payload;
      return subroutine(deriveNewContext(effect), ...subArgs);
    case 'BROADCAST':
      const { name, payload } = (effect as EffectWithContext<Broadcast>).payload;
      const broadcast = instance.broadcast(name, payload); // TODO add new context
      return broadcast;
  }
} 

const deriveNewContext = (previous: EffectWithContext): EffectContext => {
  return {
    previous,
    depth: previous.depth ? previous.depth + 1 : 1
  }
}

export const GameProcessor = buildProcessor({ afterEach });
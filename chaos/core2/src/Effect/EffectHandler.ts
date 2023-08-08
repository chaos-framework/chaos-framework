import { nextTick } from 'process';
import { ChaosInstance, EffectWithContext, Subroutine, gameProcessor } from '../internal.js'

export type EffectHandler = (instance: ChaosInstance, subroutine: Subroutine) => Promise<Subroutine>;

export async function *effectHandler(instance: ChaosInstance, subroutine: Subroutine): Subroutine {
  const inner = gameProcessor(instance, subroutine);

  let result: IteratorResult<EffectWithContext, EffectWithContext | void>;
  let effect: EffectWithContext | void;
  let next: any = undefined;

  do {
    result = await inner.next(next);
    if (result.value) {
      effect = result.value;
      if (effect) {
        for (const plugin of instance.plugins) {
          if (plugin.onEffect) {
            effect = await plugin.onEffect(instance, effect) || effect;
          }
        }

        next = yield effect;

        for (const plugin of instance.plugins) {
          if (plugin.postEffect) {
            await plugin.postEffect(instance, next);
          }
        }
      }
    }
  } while (result.value)
}

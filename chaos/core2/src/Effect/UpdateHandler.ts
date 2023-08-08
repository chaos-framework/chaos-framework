import { ChaosInstance, EffectWithContext, Subroutine, effectHandler } from '../internal.js'

export async function *updateHandler(instance: ChaosInstance, subroutine: Subroutine): Subroutine {
  const inner = effectHandler(instance, subroutine);

  let result: IteratorResult<EffectWithContext, EffectWithContext | void>;
  let effect: EffectWithContext | void;
  let next: any = undefined;

  do {
    result = await inner.next(next);
    effect = result.value;

    if (effect) {
      // TODO apply updates to the game
      next = yield effect;
    }
  } while (result.value)
}

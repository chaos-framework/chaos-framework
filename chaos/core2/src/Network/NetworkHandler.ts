import { ChaosInstance, EffectWithContext, Subroutine, updateHandler } from '../internal.js'

export async function *networkHandler(instance: ChaosInstance, subroutine: Subroutine): Subroutine {
  const inner = updateHandler(instance, subroutine);

  let result: IteratorResult<EffectWithContext, EffectWithContext | void>;
  let effect: EffectWithContext | void;
  let next: any = undefined;

  do {
    result = await inner.next(next);
    if (result.value) {
      effect = result.value;
      if (effect) {
        next = yield effect;
      }
    }
  } while (result.value)

  broadcastToClients(instance);
}

const queueForNetwork = (instance: ChaosInstance, effect: EffectWithContext) => {
  // queue for network to appropriate clients
    // players get Updates only, basically
    // admins get a lot more, plus more context probably
}

const broadcastToClients = (instance: ChaosInstance) => {

}

import { nextTick } from 'process';
import { ChaosInstance, EffectWithContext, Subroutine, buildProcessor } from '../internal.js'

const beforeEach = async (instance: ChaosInstance, effect: EffectWithContext): Promise<EffectWithContext | void> => {
  for (const plugin of instance.plugins) {
    if (plugin.onEffect) {
      effect = await plugin.onEffect(instance, effect) || effect;
    }
  }
  return effect;
}

const afterEach = async (instance: ChaosInstance, effect: EffectWithContext): Promise<EffectWithContext | void> => {
  for (const plugin of instance.plugins) {
    if (plugin.postEffect) {
      effect = await plugin.postEffect(instance, effect) || effect;
    }
  }
  return effect;
}

export const EffectProcessor = buildProcessor({ beforeEach, afterEach });

import { nextTick } from 'process';
import { ChaosInstance, EffectWithContext, Subroutine, buildProcessor, gameProcessor } from '../internal.js'

const before = async (instance: ChaosInstance, effect: EffectWithContext): Promise<EffectWithContext | void> => {
  for (const plugin of instance.plugins) {
    if (plugin.onEffect) {
      effect = await plugin.onEffect(instance, effect) || effect;
    }
  }
  return effect;
}

const after = async (instance: ChaosInstance, effect: EffectWithContext): Promise<EffectWithContext | void> => {
  for (const plugin of instance.plugins) {
    if (plugin.postEffect) {
      effect = await plugin.postEffect(instance, effect) || effect;
    }
  }
  return effect;
}

export const effectProcessor = buildProcessor(before, after); 
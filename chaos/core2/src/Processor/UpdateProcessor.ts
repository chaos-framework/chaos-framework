import { nextTick } from 'process';
import { ChaosInstance, EffectWithContext, Subroutine, buildProcessor, gameProcessor } from '../internal.js'

const afterEach = async (instance: ChaosInstance, effect: EffectWithContext): Promise<EffectWithContext | void> => {
  // TODO apply updates to the game
}

export const updateProcessor = buildProcessor({ afterEach });
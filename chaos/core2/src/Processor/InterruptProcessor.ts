import { nextTick } from 'process';
import { ChaosInstance, EffectWithContext, Subroutine, buildProcessor, gameProcessor } from '../internal.js'

const beforeEach = async (instance: ChaosInstance, effect: EffectWithContext): Promise<EffectWithContext | void> => {
  // TODO check for interrupts and enter step mode
}

export const interruptProcessor = buildProcessor({ beforeEach });
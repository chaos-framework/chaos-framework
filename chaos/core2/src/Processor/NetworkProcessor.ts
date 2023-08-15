import { nextTick } from 'process';
import { ChaosInstance, EffectWithContext, Subroutine, buildProcessor } from '../internal.js'

const beforeEach = async (instance: ChaosInstance, effect: EffectWithContext): Promise<EffectWithContext | void> => {
}

const afterEach = async (instance: ChaosInstance, effect: EffectWithContext): Promise<EffectWithContext | void> => {
  // TODO queue for broadcast
}

const afterAll = async (instance: ChaosInstance): Promise<void> => {
  // TODO broadcast to clients
}

export const networkProcessor = buildProcessor({ beforeEach, afterEach, afterAll });
import { ChaosInstance, EffectWithContext, Subroutine, SubroutineResult } from '../internal.js'

type ProcessorArguments = {
  beforeEach?: ProcessorStep,
  afterEach?: ProcessorStep,
  afterAll?: (instance: ChaosInstance) => Promise<void>
}
export type Processor = (instance: ChaosInstance, subroutine: Subroutine, subprocesses?: Processor[]) => Process;
export type ProcessorStep = (instance: ChaosInstance, effect: EffectWithContext) => Promise<EffectWithContext | void>;

export type Process = AsyncGenerator<EffectWithContext, Subroutine | void, EffectWithContext>;

export const buildProcessor = (steps: ProcessorArguments = {}): Processor => {
  async function *processor(instance: ChaosInstance, subroutine: Subroutine, subprocesses?: Processor[]): Process {
    let subprocess: Subroutine | undefined = undefined;
    if (subprocesses && subprocesses.length > 0) {
      subprocess = subprocesses[0](instance, subroutine, subprocesses.slice(1));
    }

    let result: SubroutineResult;
    let effect: EffectWithContext | undefined;
    let next: any = undefined;

    do {
      result = subprocess ? await subprocess.next(next) : await subroutine.next(next);
      if (result.value) {
        effect = result.value as EffectWithContext;

        // Run the before step
        if (steps.beforeEach) {
          effect = await steps.beforeEach(instance, effect) || effect;
        }

        // Reassign the effect to the result of any higher-order processes
        next = yield effect;
        next ??= effect;

        // Run the after step
        if (steps.afterEach) {
          next = await steps.afterEach(instance, next);
        }
      }
    } while (result.value && !result.done)

    if (steps.afterAll) {
      await steps.afterAll(instance);
    }

    if (result.done) {
      return next || result;
    }
  }

  return processor;
}
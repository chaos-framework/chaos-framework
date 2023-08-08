import { ChaosInstance, EffectWithContext, Subroutine } from '../internal.js'

type ProcessorArguments = {
  beforeEach?: ProcessorStep,
  afterEach?: ProcessorStep,
  afterAll?: (instance: ChaosInstance) => Promise<void>
}

export type Processor = (instance: ChaosInstance, subroutine: Subroutine, subprocesses?: Processor[]) => Subroutine;
export type ProcessorStep = (instance: ChaosInstance, effect: EffectWithContext) => Promise<EffectWithContext | void>;

export const buildProcessor = (steps: ProcessorArguments = {}): Processor => {
  async function *processor(instance: ChaosInstance, subroutine: Subroutine, subprocesses?: Processor[]): Subroutine {
    let subprocess: Subroutine | undefined = undefined;
    if (subprocesses && subprocesses.length > 0) {
      subprocess = subprocesses[0](instance, subroutine, subprocesses.slice(1));
    }

    let result: IteratorResult<EffectWithContext, EffectWithContext | void>;
    let effect: EffectWithContext | void;
    let next: any = undefined;
  
    do {
      result = subprocess ? await subprocess.next(next) : await subroutine.next(next);
      if (result.value) {
        effect = result.value;
  
        // Run the before step
        if (steps.beforeEach) {
          effect = await steps.beforeEach(instance, effect) || effect;
        }

        // Reassign the effect to the result of any higher-order processes
        next = yield effect || effect;

        // Run the after step
        if (steps.afterEach) {
          next = await steps.afterEach(instance, next);
        }
      }
    } while (result.value)

    if (steps.afterAll) {
      await steps.afterAll(instance);
    }
  }

  return processor;
}
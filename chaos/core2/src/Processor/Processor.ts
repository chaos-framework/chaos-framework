import { ChaosInstance, EffectWithContext, Subroutine } from '../internal.js'

export type Processor = (instance: ChaosInstance, subroutine: Subroutine, subprocesses?: Processor[]) => Subroutine;
export type ProcessorBeforeStep = (instance: ChaosInstance, effect: EffectWithContext) => Promise<EffectWithContext | void>;
export type ProcessorAfterStep = (instance: ChaosInstance, effect: EffectWithContext) => Promise<EffectWithContext | void>;

export const buildProcessor = (before?: ProcessorBeforeStep, after?: ProcessorAfterStep): Processor => {
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
        if (before) {
          effect = await before(instance, effect) || effect;
        }

        // Reassign the effect to the result of any higher-order processes
        next = yield effect || effect;

        // Run the after step
        if (after) {
          next = await after(instance, next);
        }
      }
    } while (result.value)
  }

  return processor;
}
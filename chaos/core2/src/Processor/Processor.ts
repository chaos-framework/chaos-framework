import { ChaosInstance, EffectWithContext, Subroutine, SubroutineResult } from '../internal.js'

export abstract class Processor {
  constructor(protected instance: ChaosInstance, protected inner?: Processor) {

  }

  async *process(subroutine: Subroutine): Subroutine {
    let result: SubroutineResult;
    let effect: EffectWithContext | undefined;
    let next: any = undefined;

    subroutine = this.inner ? this.inner.process(subroutine) : subroutine;

    do {
      result = await subroutine.next(next);
      if (result.value) {
        effect = result.value as EffectWithContext;

        // Reassign the effect to the result of any higher-order processes
        next = yield effect;
        next ??= effect;
      }
    } while (result.value && !result.done)

    if (result.done) {
      return next || result;
    }
  }
}

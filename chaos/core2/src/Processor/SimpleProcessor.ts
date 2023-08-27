import { ChaosInstance, EffectWithContext, Processor, Subroutine, SubroutineResult } from "../internal.js";

export type ProcessorStep = (instance: ChaosInstance, effect: EffectWithContext) => Promise<EffectWithContext | void>;

type SimpleProcessorSteps = {
  beforeEach?: ProcessorStep,
  afterEach?: ProcessorStep,
  afterAll?: (instance: ChaosInstance) => Promise<void>
}

export class SimpleProcessor extends Processor {
  constructor(instance: ChaosInstance, inner?: Processor, private steps: SimpleProcessorSteps = {}) {
    super(instance, inner);
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

        // Run the before step
        if (this.steps.beforeEach) {
          effect = await this.steps.beforeEach(this.instance, effect) || effect;
        }

        // Reassign the effect to the result of any higher-order processes
        next = yield effect;
        next ??= effect;

        // Run the after step
        if (this.steps.afterEach) {
          next = await this.steps.afterEach(this.instance, next);
        }
      }
    } while (result.value && !result.done)

    if (this.steps.afterAll) {
      await this.steps.afterAll(this.instance);
    }

    if (result.done) {
      return next || result;
    }
  }
}

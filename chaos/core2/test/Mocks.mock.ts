import { ChaosInstance, EffectContext, Subroutine } from "../src/internal.js";

async function *emptySubroutine(context: EffectContext, payload: any): Subroutine {}

export class TestGame extends ChaosInstance {
  constructor() {
    super({
      initialize: emptySubroutine,
      onPlayerJoin: emptySubroutine,
      onPlayerQuit: emptySubroutine,
      reset: emptySubroutine
    }, {});
  }
}
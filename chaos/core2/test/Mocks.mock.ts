import { ChaosInstance, EffectContext, Subroutine, broadcast } from "../src/internal.js";

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

export async function *MockSubroutine(): Subroutine {
  yield broadcast('TEST');
}


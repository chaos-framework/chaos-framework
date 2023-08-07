import { expect } from 'chai';
import 'mocha';

import { mechanic, Component, EffectContext, ChaosInstance, Entity, Mechanic, Subroutine } from '../../src/internal.js';
import { TestGame } from '../../test/Mocks.mock.js';

class MechanicTestComponent extends Component {
  @mechanic('TEST_MESSAGE')
  async *testMechanic(context: EffectContext, payload: any): Subroutine {
    yield { type: 'TEST_EFFECT', payload: {} };
  }
}

describe('Mechanics', function mechanicTests() {
  const testGame = new TestGame();
  const testEntity = new Entity(testGame);
  const testComponent = new MechanicTestComponent(testEntity);
  const testContext: EffectContext = { game: testGame };

  it('Should add passed context to yielded effects', async function addsContextToYieldedEffects() {
    const subroutine = testComponent.testMechanic(testContext, {});
    const result = await subroutine.next();
    expect(result.value?.game).to.equal(testGame);
  });

  it('Should register the mechanic with the instance when instantiated', async function addsContextToYieldedEffects() {
    const mechanic = testComponent.mechanics[0];
    expect(mechanic).to.exist;
    expect(mechanic.messageTypes).contain('TEST_MESSAGE');
  });
});

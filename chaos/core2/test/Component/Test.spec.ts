import { expect } from 'chai';
import 'mocha';

import { mechanic, Component, EffectContext, Chaos, Entity, Mechanic, Subroutine } from '../../src/internal.js';
import { TestGame } from '../../test/Mocks.js';

class MechanicTestComponent extends Component {
  @mechanic('TEST_MESSAGE')
  async *testMechanic(context: EffectContext, payload: any): Subroutine {
    yield { type: 'TEST_EFFECT', payload: {} };
  }
}


describe('just testing anything lol', () => {
  it('should work', () => {
    
  })
})
import { expect } from 'chai';
import 'mocha';
import { Action, Component, EffectGenerator } from '@chaos-framework/core';

import { OnPhase } from './OnPhase.js';

class MockComponent extends Component {
  @OnPhase('modify')
  async *defaultA(action: Action): EffectGenerator {}

  @OnPhase('react')
  async *defaultB(action: Action): EffectGenerator {}

  @OnPhase('permit', 'game')
  async *gameA(action: Action): EffectGenerator {}

  @OnPhase('permit', 'game')
  async *gameB(action: Action): EffectGenerator {}
}

describe('OnPhase Decorator', function () {
  it("Populates the component's action handlers", function () {
    const mock = new MockComponent();
    expect(mock.actionHandlers.default?.['modify']).to.be.lengthOf(1);
    expect(mock.actionHandlers.default?.['react']).to.be.lengthOf(1);
    expect(mock.actionHandlers.game?.['permit']).to.be.lengthOf(2);
  });
});

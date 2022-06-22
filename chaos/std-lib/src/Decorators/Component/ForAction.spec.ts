import { expect } from 'chai';
import 'mocha';
import {
  Action,
  EffectGenerator,
  MessageAction,
  MoveAction,
  TerminalMessage
} from '@chaos-framework/core';

import { For, ForAction } from './ForAction.js';

class MockComponent {
  @ForAction(MoveAction)
  async *stop(action: Action): EffectGenerator {
    yield action.react(action);
    yield action.followup(action);
  }
}

const mockTerminalMessageGenerator = (action: Action): TerminalMessage => {
  throw new Error(); // will never get called
};

describe('ForAction Decorator', function () {
  it('Blocks other actions passed into an ActionHandler', async function () {
    const mock = new MockComponent();
    const generator = await mock.stop.call(
      mock,
      new MessageAction({ message: mockTerminalMessageGenerator })
    );
    const next = await generator.next();
    expect(next.value).to.be.undefined;
    expect(next.done).to.be.true;
  });
});

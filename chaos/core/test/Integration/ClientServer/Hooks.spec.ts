import { expect } from 'chai';
import 'mocha';

import {
  Action,
  Chaos,
  LogicalAction,
  ActionHook,
  ExecutionHook,
  ProcessEffectGenerator,
  Event,
  processRunner
} from '../../../src/internal.js';

class FollowupEvent implements Event {
  async *run(): ProcessEffectGenerator {
    yield Action.immediate(new LogicalAction('TEST'));
    yield Action.immediate(new LogicalAction('TEST'));
    yield Action.immediate(new LogicalAction('TEST'));
    return true;
  }
}

describe('Hooks', function () {
  beforeEach(function () {
    Chaos.reset();
  });

  describe('Action hooks', function () {
    it('Successfully subscribes to actions when applied', async function () {
      let callCount = 0;
      const testHook: ActionHook = (action: Action) => {
        callCount++;
      };
      Chaos.attachActionHook(testHook);
      await processRunner(new LogicalAction('TEST'), true);
      await processRunner(new LogicalAction('TEST'), true);
      await processRunner(new LogicalAction('TEST'), true);
      expect(callCount).to.equal(3);
    });
  });

  describe('Execution hooks', function () {
    it('Successfully subscribes to execution completion when applied', async function () {
      let callCount = 0;
      let totalActions = 0;
      const testHook: ExecutionHook = (actions: Action[]) => {
        callCount++;
        totalActions = actions.length;
      };
      Chaos.attachExecutionHook(testHook);
      await processRunner(new FollowupEvent(), true);
      expect(callCount).to.equal(1);
      expect(totalActions).to.equal(3);
    });
  });
});

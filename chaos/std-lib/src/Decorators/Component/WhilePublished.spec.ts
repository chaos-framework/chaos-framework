import { expect } from 'chai';
import 'mocha';
import { Action, Component, EffectGenerator, Entity } from '@chaos-framework/core';

import { WhilePublished } from './WhilePublished.js';

class MockComponent extends Component {
  @WhilePublished
  async *test(action: Action): EffectGenerator {
    yield action.react(action);
  }
}

describe.skip('WhilePublished Decorator', function () {});

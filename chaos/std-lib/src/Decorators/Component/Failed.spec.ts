import { expect } from 'chai';
import 'mocha';
import { Action, Component, EffectGenerator, Entity } from '@chaos-framework/core';

import { Failed } from './Failed.js';

class MockComponent extends Component {
  @Failed
  async *test(action: Action): EffectGenerator {
    yield action.react(action);
  }
}

describe('Failed Decorator', function () {
  let entity: Entity;
  let component: MockComponent;
  let action: Action;
  this.beforeEach(function () {
    entity = new Entity();
    component = new MockComponent();
    entity._attach(component);
    action = new Entity().addProperty({ name: 'HP', current: 0 });
  });

  it('Ignores actions applied', async function () {
    action.applied = true;
    const generator = await component.test.call(component, action);
    const next = await generator.next();
    expect(next.value).to.not.exist;
    expect(next.done).to.be.true;
  });

  it('Runs failed actions', async function () {
    action.applied = false;
    const generator = await component.test.call(component, action);
    const next = await generator.next();
    expect(next.value).to.exist;
    expect(next.done).to.be.false;
  });
});

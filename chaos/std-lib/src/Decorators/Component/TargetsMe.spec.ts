import { expect } from 'chai';
import 'mocha';
import { Action, Component, EffectGenerator, Entity } from '@chaos-framework/core';

import { TargetsMe } from './TargetsMe.js';

class MockComponent extends Component {
  @TargetsMe
  async *test(action: Action): EffectGenerator {
    yield action.react(action);
  }
}

describe('TargetsMe Decorator', function () {
  let entity: Entity;
  let component: MockComponent;
  this.beforeEach(function () {
    entity = new Entity();
    component = new MockComponent();
    entity._attach(component);
  });

  it('Ignores actions not targetting component parent', async function () {
    const generator = await component.test.call(
      component,
      new Entity().addProperty({ name: 'HP', current: 0 })
    );
    const next = await generator.next();
    expect(next.value).to.not.exist;
    expect(next.done).to.be.true;
  });

  it('Does not ignore actions targetting component parent', async function () {
    const generator = await component.test.call(
      component,
      entity.addProperty({ name: 'HP', current: 0 })
    );
    const next = await generator.next();
    expect(next.value).to.exist;
    expect(next.done).to.be.false;
  });
});

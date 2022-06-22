import { expect } from 'chai';
import 'mocha';
import { Action, Component, EffectGenerator, Entity, Team } from '@chaos-framework/core';

import { TargetsMyTeam } from './TargetsMyTeam.js';

class MockComponent extends Component<Entity> {
  @TargetsMyTeam
  async *test(action: Action): EffectGenerator {
    yield action.react(action);
  }
}

describe('TargetsMyTeam Decorator', function () {
  let entity: Entity;
  let teammate: Entity;
  let component: MockComponent;
  let team: Team;
  this.beforeEach(function () {
    entity = new Entity();
    teammate = new Entity();
    component = new MockComponent();
    team = new Team();
    entity._attach(component);
    entity._joinTeam(team);
    teammate._joinTeam(team);
  });

  it('Ignores actions not targetting entity or teammate', async function () {
    let generator = await component.test.call(
      component,
      new Entity().addProperty({ name: 'HP', current: 0 })
    );
    let next = await generator.next();
    expect(next.value).to.not.exist;
    expect(next.done).to.be.true;
  });

  it('Runs actions targetting entity or teammate', async function () {
    let generator = await component.test.call(
      component,
      entity.addProperty({ name: 'HP', current: 0 })
    );
    let next = await generator.next();
    expect(next.value).to.exist;
    expect(next.done).to.be.false;
    generator = await component.test.call(
      component,
      teammate.addProperty({ name: 'HP', current: 0 })
    );
    next = await generator.next();
    expect(next.value).to.exist;
    expect(next.done).to.be.false;
  });
});

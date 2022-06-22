import { expect } from 'chai';
import 'mocha';
import { Action, Component, EffectGenerator, Entity, Player, Team } from '@chaos-framework/core';

import { TargetsMyPlayers } from './TargetsMyPlayers.js';

class MockComponent extends Component {
  @TargetsMyPlayers
  async *test(action: Action): EffectGenerator {
    yield action.react(action);
  }
}

describe('TargetsOneOfMyPlayersEntities Decorator', function () {
  let entityA: Entity;
  let entityB: Entity;
  let entityAB: Entity; // owned by both
  let playerA: Player;
  let playerB: Player;
  let component: MockComponent;
  let team: Team;
  this.beforeEach(function () {
    entityA = new Entity();
    entityB = new Entity();
    entityAB = new Entity();
    playerA = new Player();
    playerB = new Player();
    component = new MockComponent();
    team = new Team();
    entityA._attach(component);
    entityA._grantOwnershipTo(playerA);
    entityB._grantOwnershipTo(playerB);
    entityAB._grantOwnershipTo(playerA);
    entityAB._grantOwnershipTo(playerB);
  });

  it('Ignores actions not targetting entity owned by parent entity owners', async function () {
    let generator = await component.test.call(
      component,
      entityB.addProperty({ name: 'HP', current: 0 })
    );
    let next = await generator.next();
    expect(next.value).to.not.exist;
    expect(next.done).to.be.true;
  });

  it('Runs actions targetting entity owned by parent entity owners', async function () {
    let generator = await component.test.call(
      component,
      entityA.addProperty({ name: 'HP', current: 0 })
    );
    let next = await generator.next();
    expect(next.value).to.exist;
    expect(next.done).to.be.false;
    generator = await component.test.call(
      component,
      entityAB.addProperty({ name: 'HP', current: 0 })
    );
    next = await generator.next();
    expect(next.value).to.exist;
    expect(next.done).to.be.false;
  });
});

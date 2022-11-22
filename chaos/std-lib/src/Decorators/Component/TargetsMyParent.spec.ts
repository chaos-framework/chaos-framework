import { expect } from 'chai';
import 'mocha';
import { Action, ChangeTurnAction, Component, EffectGenerator, Entity, Team } from '@chaos-framework/core';

import { TargetsMyParent } from './TargetsMyParent.js';

class MockComponent extends Component {
  @TargetsMyParent
  async *test(action: Action): EffectGenerator {
    yield action.react(action);
  }
}

describe('TargetsMyParent Decorator', function () {
  let component: MockComponent;
  this.beforeEach(function () {
    component = new MockComponent();
  });

  describe('For teams', async function () {
    let team: Team;
    beforeEach(function () {
      team = new Team();
      team.components.addComponent(component);
    });

    it('Ignores actions not targetting parent', async function () {
      let generator = await component.test.call(component, new ChangeTurnAction({ target: new Team() }));
      let next = await generator.next();
      expect(next.value).to.not.exist;
      expect(next.done).to.be.true;
    });

    it('Handles actions targetting parent', async function () {
      let generator = await component.test.call(component, new ChangeTurnAction({ target: team }));
      let next = await generator.next();
      expect(next.value).to.exist;
    });
  });
});

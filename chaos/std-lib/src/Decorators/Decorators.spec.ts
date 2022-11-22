import { expect } from 'chai';
import 'mocha';
import { AddPropertyAction, Component, EffectGenerator, Entity } from '@chaos-framework/core';

import { OnPhase, ForAction, Successful, Permitted, TargetsMe } from '../index.js';

describe('Conditional Decorator order and composition', function () {
  it('Uses conditional guards in prototype handlers regardless of decorator order', async function () {
    class Mock extends Component {
      @OnPhase('react')
      @ForAction(AddPropertyAction)
      async *a(action: AddPropertyAction): EffectGenerator {
        yield action.react(action);
      }

      @ForAction(AddPropertyAction)
      @OnPhase('react')
      async *b(action: AddPropertyAction): EffectGenerator {
        yield action.react(action);
      }
    }

    const mock = new Mock();

    expect(Mock.prototype.actionHandlers.default?.react?.length).to.equal(2);
    // Test Mock.a(), with order where OnPhase is last to handle
    // Test positive case
    let generator = await mock.a.call(mock, new Entity().addProperty({ name: 'HP', current: 0 }));
    let result = await generator.next();
    expect(result.value).to.exist;
    expect(result.done).to.be.false;
    // Test negative case (wrong action type)
    generator = await mock.a.call(mock, new Entity().removeProperty({ name: 'HP' }) as AddPropertyAction);
    result = await generator.next();
    expect(result.value).to.not.exist;
    expect(result.done).to.be.true;
    // Test Mock.b(), with order where OnPhase is last to handle
    // Test positive case
    generator = mock.b.call(mock, new Entity().addProperty({ name: 'HP', current: 0 }));
    result = await generator.next();
    expect(result.value).to.exist;
    expect(result.done).to.be.false;
    // Test negative case (wrong action type)
    generator = mock.b.call(mock, new Entity().removeProperty({ name: 'HP' }) as AddPropertyAction);
    result = await generator.next();
    expect(result.value).to.not.exist;
    expect(result.done).to.be.true;
  });
});

describe('Multiple Conditional Generators, including with bound context', function () {
  class Mock extends Component {
    @ForAction(AddPropertyAction)
    @Successful
    @Permitted
    @TargetsMe
    async *test(this: any, action: AddPropertyAction): EffectGenerator {
      yield action.react(action);
    }
  }

  it('Only runs the handler when all decorator conditions are met', async function () {
    const mock = new Mock();
    const entity = new Entity();
    mock.parent = entity;

    // All right fields but wrong action type
    const actionOfWrongType = entity.removeProperty({ name: 'Test' });
    actionOfWrongType.permitted = true;
    actionOfWrongType.applied = true;
    expect(
      (await (await mock.test.call(mock, actionOfWrongType as unknown as AddPropertyAction)).next()).value
    ).to.not.exist;

    // Right action type, wrong fields
    const wrongFieldsAction = entity.addProperty({ name: 'HP', current: 0 });
    wrongFieldsAction.applied = true;
    wrongFieldsAction.permitted = false;
    expect((await mock.test.call(mock, wrongFieldsAction).next()).value).to.not.exist;
    wrongFieldsAction.applied = false;
    wrongFieldsAction.permitted = true;
    expect((await mock.test.call(mock, wrongFieldsAction).next()).value).to.not.exist;

    // All correct conditions
    const correctAction = entity.addProperty({ name: 'HP', current: 0 });
    correctAction.applied = true;
    correctAction.permitted = true;
    correctAction.target = entity;
    expect((await mock.test.call(mock, correctAction).next()).value).to.exist;
  });
});

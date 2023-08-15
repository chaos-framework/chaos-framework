import { expect } from 'chai';
import 'mocha';

import { mechanic, Component, EffectContext, ChaosInstance, Entity, Mechanic, Subroutine, GameProcessor } from '../internal.js';
import { TestGame } from '../../test/Mocks.mock.js';

describe('GameProcessor', () => {
  it('Should pass the proper subroutine back on being yielded a BROADCAST', async () => {
    let returned: any;
    async function *broadcastingSubroutine(context: EffectContext, payload: any): Subroutine {
      returned = yield { type: 'BROADCAST', payload: { name: 'TEST_BROADCAST', payload: {} }};
    }

    const processor = GameProcessor(new TestGame(), broadcastingSubroutine({}, {}));

    // Run twice, so that the broadcaster is sent back down
    await processor.next();
    await processor.next();

    expect(returned).to.exist;
  });

  it('Should pass the proper function result back on being yielded a CALL', async () => {
    let returned: any;

    const calledFn = (a: number, b: number) => (a + b);

    async function *callingSubroutine(context: EffectContext, payload: any): Subroutine {
      returned = yield { type: 'CALL', payload: { fn: calledFn, args: [10, 5] }};
    }

    const processor = GameProcessor(new TestGame(), callingSubroutine({}, {}));

    // Run twice, so that the broadcaster is sent back down
    await processor.next();
    await processor.next();

    expect(returned).to.equal(15);
  });

  it('Should pass the proper subroutine back on being yielded a SUBROUTINE', async () => {
    let returned: any;

    async function *calledSubroutine(context: EffectContext, a: number, b: number) {
      yield a + b;
    };

    async function *callingSubroutine(context: EffectContext, payload: any): Subroutine {
      const sub = yield { type: 'SUBROUTINE', payload: { subroutine: calledSubroutine, args: [10, 5] }};
      returned = await (sub as unknown as AsyncGenerator).next();
    }

    const processor = GameProcessor(new TestGame(), callingSubroutine({}, {}));

    // Run twice, so that the broadcaster is sent back down
    await processor.next();
    await processor.next();

    expect(returned).to.exist;
    expect(returned.value).to.equal(15);
  });

});

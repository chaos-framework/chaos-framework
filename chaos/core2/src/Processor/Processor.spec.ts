import { expect } from 'chai';
import 'mocha';

import { mechanic, Component, EffectContext, ChaosInstance, Entity, Mechanic, Subroutine, defaultProcessor } from '../../src/internal.js';
import { TestGame } from '../../test/Mocks.mock.js';

describe('Default Processor', () => {
  it('Should yield effects back to the function calling the processor', async () => {
    const simpleEffect = { type: 'BROADCAST', payload: { name: 'TEST_BROADCAST', payload: {} }};

    async function *simpleSubroutine(context: EffectContext, payload: any): Subroutine {
      yield simpleEffect;
    }
    const processor = defaultProcessor(new TestGame(), simpleSubroutine({}, {}));

    const result = await processor.next();

    expect(result.value).to.equal(simpleEffect);
  });

  it('Should pass the proper subroutine back on being yielded a BROADCAST', async () => {
    let returned: any;
    async function *broadcastingSubroutine(context: EffectContext, payload: any): Subroutine {
      returned = yield { type: 'BROADCAST', payload: { name: 'TEST_BROADCAST', payload: {} }};
    }

    const processor = defaultProcessor(new TestGame(), broadcastingSubroutine({}, {}));

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

    const processor = defaultProcessor(new TestGame(), callingSubroutine({}, {}));

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
      returned = await sub.next();
    }

    const processor = defaultProcessor(new TestGame(), callingSubroutine({}, {}));

    // Run twice, so that the broadcaster is sent back down
    await processor.next();
    await processor.next();

    expect(returned).to.exist;
    expect(returned.value).to.equal(15);
  });

});

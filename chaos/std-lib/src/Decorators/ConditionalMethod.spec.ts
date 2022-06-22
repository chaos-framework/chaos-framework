import { expect } from 'chai';
import 'mocha';

import { ConditionalMethod } from './ConditionalMethod.js';

class Mock {
  a = 5;

  @ConditionalMethod(function (this: Mock) {
    return this.a === 5;
  })
  shouldRun(): boolean | undefined {
    return true;
  }

  @ConditionalMethod(function (this: Mock) {
    return this.a === 10;
  })
  shouldNotRun(): boolean | undefined {
    return true;
  }
}

describe('Conditional Method', function () {
  it('Only actually runs the functions with a simple conditional function that resolves to true at runtime', async function () {
    const mock = new Mock();
    expect(mock.shouldRun()).to.be.true;
    expect(mock.shouldNotRun()).to.be.undefined;
    mock.a = 10;
    expect(mock.shouldRun()).to.be.undefined;
    expect(mock.shouldNotRun()).to.be.true;
    mock.a = 0;
    expect(mock.shouldRun()).to.be.undefined;
    expect(mock.shouldNotRun()).to.be.undefined;
  });
});

import { expect } from 'chai';
import 'mocha';

import { BoundConditionalGenerator } from './BoundConditionalGenerator.js';

function RedundantExtra(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value!;
  descriptor.value = function () {
    return original.apply(this);
  };
}

class Mock {
  a = 5;

  @BoundConditionalGenerator(function (this: Mock) {
    return this.a === 5;
  })
  async *shouldRun(): AsyncGenerator<boolean> {
    yield true;
  }

  @BoundConditionalGenerator(function (this: Mock) {
    return this.a === 10;
  })
  async *shouldNotRun(): AsyncGenerator<boolean> {
    yield true;
  }

  @RedundantExtra
  @BoundConditionalGenerator(function (this: Mock) {
    return this.a === 5;
  })
  async *nested(): AsyncGenerator<boolean> {
    yield true;
  }
}

describe('Bound Conditional Generator', function () {
  it('Only actually yields the generators with a simple conditional function that resolves to true at runtime', async function () {
    const mock = new Mock();
    expect((await mock.shouldRun().next())?.value).to.be.true;
    expect((await mock.shouldNotRun().next())?.value).to.be.undefined;
    mock.a = 10;
    expect((await mock.shouldRun().next())?.value).to.be.undefined;
    expect((await mock.shouldNotRun().next())?.value).to.be.true;
    mock.a = 0;
    expect((await mock.shouldRun().next())?.value).to.be.undefined;
    expect((await mock.shouldNotRun().next())?.value).to.be.undefined;
  });

  it('Works with "this" context even when nested under another decorator', async function () {
    const mock = new Mock();
    expect((await mock.nested().next())?.value).to.be.true;
  });
});

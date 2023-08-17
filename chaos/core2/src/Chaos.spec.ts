import { expect } from 'chai';
import sinon from 'sinon';
import 'mocha';
import { CastCommand, ChaosInstance, CommandWithContext } from './internal.js';
import { TestInstance } from '../test/Mocks.mock.js';

describe('Chaos Instance', () => {
  describe('Command handling', () => {
    it('Should add commands when recieved and run the processor', async () => {
      const instance = new TestInstance();
      const fakeProcessor = sinon.fake();
      sinon.replace(instance, 'process', fakeProcessor);

      const fakeCommand = {} as unknown as CommandWithContext;

      instance.recieveCommand(fakeCommand);

      expect(instance.queuedCommands.first).to.equal(fakeCommand);
      expect(fakeProcessor.calledOnce).to.be.true;
    });
  });

  describe('Processing commands and subroutines', () => {
    it('Should exit the processor if it was called when it was already running', async () => {

    });
    it('Execute the commands in the order added', async () => {

    });
  });
});

import { expect } from 'chai';
import 'mocha';

import { buildProcessor, ChaosInstance, EffectWithContext, broadcast, Subroutine, EffectContext, Processor, Process } from '../internal.js'

import { TestInstance } from '../../test/Mocks.mock.js';
import { MockEmptySubroutine, MockSubroutine } from './Processor.mock.js';

describe('Generic Processors', () => {
  describe('buildProcessor', () => {
    describe('beforeEach', () => {
      it('Should call the before step and yield the modified effect', async () => {
        let called = false;
        const beforeEach = async (instance: ChaosInstance, effect: EffectWithContext) => {
          called = true;
          return broadcast('MODIFIED');
        }
  
        const processor = buildProcessor({ beforeEach });
        const subroutine = processor(new TestInstance, MockSubroutine());
  
        const result = await subroutine.next();
  
        expect(called).to.be.true;
        expect((result.value as EffectWithContext).payload?.name).to.equal('MODIFIED');
      });
  
      it('Should yield the original effect if none returned from the before step', async () => {
        const beforeEach = async (instance: ChaosInstance, effect: EffectWithContext) => {
        }
  
        const processor = buildProcessor({ beforeEach });
        const subroutine = processor(new TestInstance, MockSubroutine());
  
        const result = await subroutine.next();
  
        expect((result.value as EffectWithContext).payload?.name).to.equal('ORIGINAL');
      });
  
      it('Should yield the original effect if no before step was passed', async () => {
        const processor = buildProcessor();
        const subroutine = processor(new TestInstance, MockSubroutine());
  
        const result = await subroutine.next();
  
        expect((result.value as EffectWithContext).payload?.name).to.equal('ORIGINAL');
      });
    });

    describe('afterEach', () => {
      it('Should call the after step', async () => {
        let called = false;
        const afterEach = async (instance: ChaosInstance, effect: EffectWithContext) => {
          called = true;
        }

        const processor = buildProcessor({ afterEach });
        const subroutine = processor(new TestInstance, MockSubroutine());
  
        await subroutine.next();
        await subroutine.next();
  
        expect(called).to.be.true;
      });

      it('Should pass the results of after to the subprocess/subroutine', async () => {
        let passedDown: any;

        const afterEach = async (instance: ChaosInstance, effect: EffectWithContext) => {
          return broadcast('PASSED_DOWN');
        }

        async function *subprocess(instance: ChaosInstance, subroutine: Subroutine): Subroutine {
          passedDown = yield broadcast('PASSED_UP');
        }

        const processor = buildProcessor({ afterEach });
        const subroutine = processor(new TestInstance, MockSubroutine(), [subprocess]);
  
        await subroutine.next();
        await subroutine.next();
  
        expect(passedDown.payload.name).to.equal("PASSED_DOWN");
      });
    });

    describe('afterAll', () => {
      it('Should be executed at the end of the subroutine loop.', async () => {
        let called = false;
        const afterAll = async (instance: ChaosInstance) => {
          called = true;
        }

        async function *subprocess(instance: ChaosInstance, subroutine: Subroutine): Subroutine {
          yield broadcast('1');
          yield broadcast('2');
          yield broadcast('3');
        }

        const processor = buildProcessor({ afterAll });
        const subroutine = processor(new TestInstance, MockEmptySubroutine(), [subprocess]);
  
        await subroutine.next();
        await subroutine.next();
        await subroutine.next();
        expect(called).to.be.false;
        
        await subroutine.next();
        expect(called).to.be.true;
      });
    });

    describe('Returning subroutines', () => {
      it('Should return a subroutine if yielded from a subprocess', async () => {
        async function *subprocess(instance: ChaosInstance, subroutine: Subroutine, subprocesses?: Processor[]): Process {
          yield * subroutine;
          return MockSubroutine();
        }

        const processor = buildProcessor();
        const process = processor(new TestInstance, MockEmptySubroutine(), [subprocess]);

        await process.next();
        let result = await process.next();

        expect(result.done).to.be.true;
        expect(typeof result.value).to.equal('object');
      });
    });
  });
});

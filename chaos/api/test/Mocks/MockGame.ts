import {
  Chaos,
  Player,
  CONNECTION,
  CONNECTION_RESPONSE,
  Game,
  ProcessEffectGenerator
} from '@chaos-framework/core';

// TODO move this to (new) standard testing lib? feel like I'll be rewriting this a bit..
export default class MockGame implements Game {
  // initialize(option?: any): ProcessEffectGenerator;
  // shutdown(): void;
  // play(): ProcessEffectGenerator;
  // onPlayerConnect(msg: CONNECTION): ProcessEffectGenerator<Player>;
  // onPlayerDisconnect(option: any): ProcessEffectGenerator;

  async *initialize(options: any = {}): ProcessEffectGenerator {
    return true;
  }

  async *onPlayerConnect(msg: CONNECTION): ProcessEffectGenerator<Player> {
    throw new Error('Not defined.');
  }

  async *onPlayerDisconnect(options: any): ProcessEffectGenerator<boolean> {
    return true;
  }

  reset() {
    Chaos.reset();
  }

  async *play(): ProcessEffectGenerator<boolean> {
    return true;
  }

  shutdown() {}
}

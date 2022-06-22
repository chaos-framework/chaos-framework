import { Chaos, Player, CONNECTION, CONNECTION_RESPONSE, Game } from '@chaos-framework/core';

// TODO move this to (new) standard testing lib? feel like I'll be rewriting this a bit..
export default class MockGame implements Game {
  // initialize(option?: any): ProcessEffectGenerator;
  // shutdown(): void;
  // play(): ProcessEffectGenerator;
  // onPlayerConnect(msg: CONNECTION): ProcessEffectGenerator<Player>;
  // onPlayerDisconnect(option: any): ProcessEffectGenerator;

  initialize(option: any): void {}

  onPlayerConnect(msg: CONNECTION): CONNECTION_RESPONSE {
    return {
      connectedPlayerId: 'test',
      gameState: Chaos.serializeForScope(new Player())
    };
  }

  onPlayerDisconnect(options: any): void {}

  reset() {
    Chaos.reset();
  }

  play() {}

  shutdown() {}
}

import { CONNECTION, Player, ProcessEffectGenerator } from '../internal.js';

export interface Game {
  initialize(option?: any): ProcessEffectGenerator;
  shutdown(): void;
  play(): ProcessEffectGenerator;
  onPlayerConnect(msg: CONNECTION): ProcessEffectGenerator<Player>;
  onPlayerDisconnect(option: any): ProcessEffectGenerator;
}

export function isGame(o: any): o is Game {
  return (
    typeof o.initialize === 'function' &&
    typeof o.play === 'function' &&
    typeof o.onPlayerConnect === 'function' &&
    typeof o.onPlayerDisconnect === 'function' &&
    typeof o.shutdown === 'function'
  );
}

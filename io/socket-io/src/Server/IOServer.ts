import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  Chaos,
  CONNECTION,
  Effect,
  EffectGenerator,
  EffectRunner,
  Game,
  Player,
  ProcessEffect,
  ProcessEffectGenerator,
  ProcessEffectRunner,
  processRunner,
  Server
} from '@chaos-framework/core';

import { ServerToClientEvents, ClientToServerEvents, InterServerEvents } from '../CommonIO.js';
import { IOServerClient } from './IOServerClient.js';

export class IOServer implements Server {
  // TODO upgrade socketio to use the new fourth param for CONNECTION interface
  readonly server: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents>;

  constructor(public port: number = 1980, public game: Game, private options: any = {}) {
    this.server = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents>(
      undefined,
      options
    );
    this.initializeEvents();
    this.server.listen(port);
  }

  initializeEvents() {
    const { server } = this;
    server.on('connection', async (socket: Socket) => {
      const query = socket.handshake.query as unknown as CONNECTION;
      const generator = this.game.onPlayerConnect(query);
      const player = (await processRunner(generator as ProcessEffectGenerator<any>, true)).result as Player;
      if (player === undefined) {
        throw new Error('No player returned from onPlayerConnect');
      }
      const stateWithPlayer = Chaos.serializeForScope(player);
      new IOServerClient(player, socket); // Just to assign client to player
      console.log(
        `User connected from ${socket.handshake.address} with username ${query.desiredUsername}. Assigned player ID ${player.id}`
      );
      socket.emit('CONNECTION_RESPONSE', stateWithPlayer);
    });

    // TODO on cast
  }

  shutdown() {
    this.server.disconnectSockets();
    this.server.close();
  }
}

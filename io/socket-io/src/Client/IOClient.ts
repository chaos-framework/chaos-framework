import { io, Socket } from 'socket.io-client';
import { ulid } from 'ulid';
import { Queue } from 'queue-typescript';

import {
  Client,
  Player,
  CONNECTION,
  CONNECTION_RESPONSE,
  MessageType,
  Chaos,
  ActionDeserializer,
  processRunner
} from '@chaos-framework/core';

import { ServerToClientEvents, ClientToServerEvents } from '../CommonIO.js';

export class IOClient implements Client {
  id = ulid();
  broadcastQueue = new Queue<any>();
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  player: Player;
  loaded = false;
  connectionCallback?: (err?: string) => void; // optional callback to notify app that the loading has completed

  constructor(uri: string, desiredUsername: string, connectionOptions: any) {
    const query: CONNECTION = { desiredUsername };
    this.socket = io(uri, { query, autoConnect: false, ...connectionOptions });

    this.player = new Player({ username: 'Awaiting Connection' });

    this.initializeEvents();
  }

  initializeEvents() {
    this.socket.on(MessageType.CONNECTION_RESPONSE, (response: CONNECTION_RESPONSE) => {
      Chaos.DeserializeAsClient(response.gameState, response.connectedPlayerId);
      const player = Chaos.players.get(response.connectedPlayerId);
      if (player === undefined) {
        this.disconnect();
        throw new Error('Got a bad response from the server -- was assigned to a non-existant player.');
      }
      this.player = player;
      this.loaded = true;
      if (this.connectionCallback !== undefined) {
        this.connectionCallback();
      }
    });

    this.socket.on(MessageType.ACTION, (json: any) => {
      try {
        console.log(JSON.stringify(json));
        const action = ActionDeserializer.deserializeAction(json);
        processRunner(action, false);
      } catch (err) {
        console.error('Got a bad action payload from the server that could not be deserialized.');
        console.error((err as Error).message);
        this.disconnect();
      }
    });
  }

  connect(uri: string) {
    if (!this.socket.connected) {
      this.socket.connect();
    }
    return true;
  }

  broadcast(): boolean {
    return false; // TODO this broadcasts TO the server
  }

  broadcastEnqueued(): boolean {
    return false; // TODO this broadcasts TO the server
  }

  disconnect(): boolean {
    this.socket.disconnect();
    return true;
  }
}
